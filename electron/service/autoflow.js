'use strict'

const path = require('path')
const fs = require('fs').promises
const { logger } = require('ee-core/log')
const { getExtraResourceDir } = require('./pathHelper')
const { engineBus } = require('./engineBus')
const { engineService } = require('./engine')

/**
 * AutoFlow 配置存储目录（开发：项目根目录；生产：exe 同级目录）
 */
function getAutoFlowDir() {
  return getExtraResourceDir('autoflows')
}

/**
 * 将名称转换为安全文件名（不含扩展名）
 * @param {string} name
 * @returns {string}
 */
function toSafeBaseName(name) {
  return String(name || '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 80)
}

/**
 * 读取 JSON 文件并解析
 * @param {string} filePath
 * @returns {Promise<any>}
 */
async function readJsonFile(filePath) {
  const text = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(text)
}

/**
 * 写入 JSON 文件（格式化输出）
 * @param {string} filePath
 * @param {any} obj
 */
async function writeJsonFile(filePath, obj) {
  const text = JSON.stringify(obj, null, 2)
  await fs.writeFile(filePath, text, 'utf-8')
}

/**
 * @typedef {Object} AutoFlowStep
 * @property {'send'|'wait'|'delay'|'log'|'end'} type
 *
 * @typedef {Object} AutoFlowExpect
 * @property {string=} sf 例如 "S6F12"
 * @property {number=} stream
 * @property {number=} func
 * @property {boolean=} wBit
 * @property {string=} smlIncludes SML 文本包含判断
 * @property {Array<{path: string, op: string, value?: any}>=} conditions 条件数组（AND）
 *
 * AutoFlow 配置校验（尽量严格，避免运行时才报错）
 * @param {any} flow
 */
function validateAutoFlow(flow) {
  if (!flow || typeof flow !== 'object') {
    throw new Error('AutoFlow 配置必须是对象')
  }
  if (!flow.name || typeof flow.name !== 'string') {
    throw new Error('AutoFlow 配置必须包含 name（字符串）')
  }
  if (!flow.tool || typeof flow.tool !== 'string') {
    throw new Error('AutoFlow 配置必须包含 tool（引擎名称，字符串）')
  }
  if (flow.variables != null) {
    throw new Error('AutoFlow 不支持 variables 字段')
  }
  if (!Array.isArray(flow.steps) || flow.steps.length === 0) {
    throw new Error('AutoFlow 配置必须包含 steps（非空数组）')
  }
  if (flow.steps[0]?.type !== 'send') {
    throw new Error('AutoFlow 的第一步必须是 send（用于触发 EAP 流程开始）')
  }

  for (let i = 0; i < flow.steps.length; i += 1) {
    const step = flow.steps[i]
    if (!step || typeof step !== 'object') {
      throw new Error(`第 ${i + 1} 步配置非法：必须是对象`)
    }
    const type = step.type
    if (!['send', 'wait', 'delay', 'log', 'end'].includes(String(type))) {
      throw new Error(`第 ${i + 1} 步 type 不支持：${String(type)}`)
    }
    if (type === 'send') {
      if (!step.filePath || typeof step.filePath !== 'string') {
        throw new Error(`第 ${i + 1} 步（send）必须包含 filePath（SML 相对路径）`)
      }
      if (step.saveVars != null) {
        throw new Error(`第 ${i + 1} 步（send）不支持 saveVars`)
      }
      if (step.timeoutMs != null && (!Number.isFinite(Number(step.timeoutMs)) || Number(step.timeoutMs) <= 0)) {
        throw new Error(`第 ${i + 1} 步（send）timeoutMs 必须是正数`)
      }
    }
    if (type === 'wait') {
      if (!step.expect || typeof step.expect !== 'object') {
        throw new Error(`第 ${i + 1} 步（wait）必须包含 expect（匹配条件）`)
      }
      if (step.saveVars != null) {
        throw new Error(`第 ${i + 1} 步（wait）不支持 saveVars`)
      }
      if (step.timeoutMs != null && (!Number.isFinite(Number(step.timeoutMs)) || Number(step.timeoutMs) <= 0)) {
        throw new Error(`第 ${i + 1} 步（wait）timeoutMs 必须是正数`)
      }
    }
    if (type === 'delay') {
      if (!Number.isFinite(Number(step.ms)) || Number(step.ms) < 0) {
        throw new Error(`第 ${i + 1} 步（delay）ms 必须是非负数`)
      }
    }
    if (type === 'log') {
      if (typeof step.message !== 'string') {
        throw new Error(`第 ${i + 1} 步（log）必须包含 message（字符串）`)
      }
    }
  }
}

/**
 * 将 "S6F12" 解析为 { stream: 6, func: 12 }
 * @param {string} sf
 * @returns {{stream: number, func: number} | null}
 */
function parseSf(sf) {
  const m = /^S(\d+)F(\d+)$/i.exec(String(sf || '').trim())
  if (!m) return null
  const stream = Number.parseInt(m[1], 10)
  const func = Number.parseInt(m[2], 10)
  if (!Number.isFinite(stream) || !Number.isFinite(func)) return null
  return { stream, func }
}

/**
 * 通过路径安全读取对象值
 * 支持：a.b[0].c / a[0][1].value
 * @param {any} obj
 * @param {string} pathExpr
 * @returns {any}
 */
function getByPath(obj, pathExpr) {
  const expr = String(pathExpr || '').trim()
  if (!expr) return undefined

  const normalized = expr.replace(/\[(\d+)\]/g, '.$1').replace(/^\./, '')
  const parts = normalized.split('.').filter(Boolean)

  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    const isIndex = /^\d+$/.test(p)
    if (isIndex) {
      const idx = Number.parseInt(p, 10)
      cur = Array.isArray(cur) ? cur[idx] : undefined
    } else {
      cur = cur[p]
    }
  }
  return cur
}

/**
 * 判断单个条件
 * @param {any} msg
 * @param {{path: string, op: string, value?: any}} cond
 * @returns {boolean}
 */
function evalCondition(msg, cond) {
  const op = String(cond?.op || '')
  const left = getByPath(msg, String(cond?.path || ''))

  if (op === 'exists') return left !== undefined && left !== null
  if (op === 'eq') return left === cond.value
  if (op === 'neq') return left !== cond.value
  if (op === 'contains') return String(left ?? '').includes(String(cond.value ?? ''))
  if (op === 'regex') {
    const re = new RegExp(String(cond.value ?? ''))
    return re.test(String(left ?? ''))
  }

  const ln = Number(left)
  const rn = Number(cond.value)
  if (!Number.isFinite(ln) || !Number.isFinite(rn)) return false
  if (op === 'gt') return ln > rn
  if (op === 'gte') return ln >= rn
  if (op === 'lt') return ln < rn
  if (op === 'lte') return ln <= rn

  return false
}

/**
 * 消息匹配（用于 wait/expect）
 * @param {any} msg secs4js SecsMessage
 * @param {string} sml
 * @param {AutoFlowExpect} expect
 * @returns {boolean}
 */
function matchMessage(msg, sml, expect) {
  if (!expect) return true

  const bySf = expect.sf ? parseSf(expect.sf) : null
  const stream = bySf ? bySf.stream : expect.stream
  const func = bySf ? bySf.func : expect.func

  if (stream != null && Number(stream) !== Number(msg.stream)) return false
  if (func != null && Number(func) !== Number(msg.func)) return false
  if (typeof expect.wBit === 'boolean' && Boolean(expect.wBit) !== Boolean(msg.wBit)) return false

  if (expect.smlIncludes && !String(sml || '').includes(String(expect.smlIncludes))) return false

  const conds = Array.isArray(expect.conditions) ? expect.conditions : []
  for (const c of conds) {
    if (!evalCondition(msg, c)) return false
  }
  return true
}

/**
 * AutoFlow 运行器
 *
 * 核心能力：
 * - 顺序执行 steps
 * - send：按 SML 文件发送；可同步等待 reply 或异步等待匹配消息
 * - wait：等待对端发来满足 expect 的消息
 * - 支持 timeout、暂停/继续、停止
 */
class AutoFlowRunner {
  /**
   * @param {string} runId
   * @param {any} flow
   * @param {{sendEvent: (type: string, payload: any) => void}} hooks
   */
  constructor(runId, flow, hooks) {
    this.runId = runId
    this.flow = flow
    this.hooks = hooks

    this.state = 'idle'
    this.currentStepIndex = 0
    this.totalSteps = Array.isArray(flow.steps) ? flow.steps.length : 0

    this._stopped = false
    this._paused = false
    this._pauseWaiter = null
    this._waiting = null

    this._onEngineMessage = this._onEngineMessage.bind(this)
  }

  /**
   * 推送运行状态到渲染进程
   * @param {string} type
   * @param {any} payload
   */
  _emit(type, payload) {
    try {
      this.hooks.sendEvent(type, { runId: this.runId, ...payload })
    } catch (e) {
      logger.error('❌ [AutoFlowRunner] emit failed:', e)
    }
  }

  /**
   * 写一条 AutoFlow 内部日志（不会污染 engine/log）
   * @param {'INFO'|'WARN'|'ERROR'} level
   * @param {string} message
   */
  _log(level, message) {
    this._emit('log', { level, message, ts: Date.now() })
  }

  _setState(state) {
    this.state = state
    this._emit('state', { state })
  }

  _setProgress() {
    this._emit('progress', {
      currentStepIndex: this.currentStepIndex,
      totalSteps: this.totalSteps
    })
  }

  _onEngineMessage(payload) {
    try {
      if (!payload || payload.name !== this.flow.tool) return
      if (!this._waiting) return
      const { msg, sml } = payload
      if (!matchMessage(msg, sml, this._waiting.expect)) return

      const resolve = this._waiting.resolve
      this._waiting = null
      if (typeof resolve === 'function') resolve({ msg, sml })
    } catch (e) {
      logger.error('❌ [AutoFlowRunner] onEngineMessage error:', e)
    }
  }

  async _waitIfPaused() {
    if (!this._paused) return
    await new Promise((resolve) => {
      this._pauseWaiter = resolve
    })
  }

  pause() {
    if (this.state !== 'running') return
    this._paused = true
    this._emit('state', { state: 'paused' })
    this._emit('paused', {})
  }

  resume() {
    if (!this._paused) return
    this._paused = false
    const waiter = this._pauseWaiter
    this._pauseWaiter = null
    if (typeof waiter === 'function') waiter()
    this._emit('state', { state: 'running' })
    this._emit('resumed', {})
  }

  stop() {
    this._stopped = true
    this._emit('stopped', {})
    if (this._waiting?.reject) {
      try {
        this._waiting.reject(new Error('Stopped'))
      } catch (_) {}
    }
    this._waiting = null
  }

  /**
   * 等待一条满足条件的消息
   * @param {AutoFlowExpect} expect
   * @param {number} timeoutMs
   */
  async _waitMessage(expect, timeoutMs) {
    if (this._stopped) throw new Error('Stopped')
    if (this._waiting) throw new Error('当前已有等待中的条件，配置不允许并行等待')

    const to = Number.isFinite(Number(timeoutMs)) && Number(timeoutMs) > 0 ? Number(timeoutMs) : 30000
    this._log('INFO', `等待消息：timeout=${to}ms`)

    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this._waiting && this._waiting.resolve === resolve) {
          this._waiting = null
        }
        reject(new Error('Timeout'))
      }, to)

      this._waiting = {
        expect,
        resolve: (val) => {
          clearTimeout(timer)
          resolve(val)
        },
        reject: (err) => {
          clearTimeout(timer)
          reject(err)
        }
      }
    })
  }

  async run() {
    validateAutoFlow(this.flow)

    this._stopped = false
    this._paused = false
    this._waiting = null
    let endedByEndStep = false

    this._setState('running')
    this._setProgress()

    engineBus.on('engine:message', this._onEngineMessage)

    try {
      const configs = await engineService.getConfig()
      const cfg = Array.isArray(configs) ? configs.find((c) => c?.config?.name === this.flow.tool) : null
      if (!cfg || !cfg.config) {
        throw new Error(`未找到引擎配置：${this.flow.tool}`)
      }
      if (String(cfg.config.simulate || '') !== 'Equipment') {
        throw new Error('AutoFlow 仅允许在模拟 Equipment 端时使用')
      }

      for (this.currentStepIndex = 0; this.currentStepIndex < this.totalSteps; this.currentStepIndex += 1) {
        if (this._stopped) throw new Error('Stopped')
        await this._waitIfPaused()

        const step = this.flow.steps[this.currentStepIndex]
        const nextStep = this.flow.steps[this.currentStepIndex + 1]
        const isBeforeEnd = !!nextStep && nextStep.type === 'end'
        this._setProgress()

        if (step.type === 'log') {
          this._log(String(step.level || 'INFO'), String(step.message || ''))
          continue
        }

        if (step.type === 'end') {
          endedByEndStep = true
          this._log('INFO', 'Flow Ended')
          break
        }

        if (step.type === 'delay') {
          const ms = Number(step.ms)
          if (ms > 0) {
            this._log('INFO', `延时 ${ms}ms`)
            await new Promise((r) => setTimeout(r, ms))
          }
          continue
        }

        if (step.type === 'wait') {
          const timeoutMs = step.timeoutMs != null ? Number(step.timeoutMs) : 30000
          if (!isBeforeEnd) {
            await this._waitMessage(step.expect, timeoutMs)
            this._log('INFO', '等待条件满足，继续执行')
          }
          continue
        }

        if (step.type === 'send') {
          const timeoutMs = step.timeoutMs != null ? Number(step.timeoutMs) : 30000
          const waitReply = typeof step.waitReply === 'boolean' ? step.waitReply : undefined
          this._log('INFO', `发送：${String(step.filePath)}`)

          const waitPromise = step.expect && !isBeforeEnd ? this._waitMessage(step.expect, timeoutMs) : null

          try {
            await engineService.sendMessageFromFile(
              { name: this.flow.tool, filePath: String(step.filePath), waitReply },
              null
            )
          } catch (e) {
            if (this._waiting?.reject) {
              try {
                this._waiting.reject(e)
              } catch (_) {}
            }
            this._waiting = null
            throw e
          }

          if (waitPromise) {
            await waitPromise
            this._log('INFO', 'expect 条件满足，继续执行')
          }

          continue
        }
      }

      this._setState('completed')
      if (!endedByEndStep) {
        this._log('INFO', '流程执行完成')
      }
      return { success: true }
    } catch (error) {
      const msg = error?.message || String(error)
      if (msg === 'Stopped') {
        this._setState('stopped')
        this._log('WARN', '流程已停止')
        return { success: false, stopped: true }
      }
      this._setState('error')
      this._log('ERROR', msg)
      return { success: false, error: msg }
    } finally {
      engineBus.off('engine:message', this._onEngineMessage)
      this._waiting = null
      this._paused = false
      this._pauseWaiter = null
    }
  }
}

class AutoFlowService {
  constructor() {
    /** @type {Map<string, AutoFlowRunner>} */
    this.runners = new Map()
  }

  /**
   * 列出所有 AutoFlow 配置（仅返回摘要信息）
   */
  async listFlows() {
    const dir = getAutoFlowDir()
    await fs.mkdir(dir, { recursive: true })

    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'))
    const result = []
    for (const fileName of files) {
      try {
        const fullPath = path.join(dir, fileName)
        const flow = await readJsonFile(fullPath)
        result.push({
          name: String(flow?.name || fileName.replace(/\.json$/i, '')),
          tool: String(flow?.tool || ''),
          fileName,
          stepCount: Array.isArray(flow?.steps) ? flow.steps.length : 0,
          updatedAt: flow?.updatedAt || null
        })
      } catch (e) {
        result.push({
          name: fileName.replace(/\.json$/i, ''),
          tool: '',
          fileName,
          stepCount: 0,
          updatedAt: null,
          invalid: true
        })
      }
    }
    return result
  }

  /**
   * 获取单个 AutoFlow 配置
   * @param {{name: string}} args
   */
  async getFlow(args) {
    const name = String(args?.name || '').trim()
    if (!name) throw new Error('name 不能为空')
    const dir = getAutoFlowDir()
    const fileName = `${toSafeBaseName(name)}.json`
    const fullPath = path.join(dir, fileName)
    const flow = await readJsonFile(fullPath)
    return flow
  }

  /**
   * 保存 AutoFlow 配置（创建/更新）
   * @param {{flow: any}} args
   */
  async saveFlow(args) {
    const flow = args?.flow
    validateAutoFlow(flow)

    const dir = getAutoFlowDir()
    await fs.mkdir(dir, { recursive: true })

    const safeName = toSafeBaseName(flow.name)
    if (!safeName) throw new Error('name 非法')

    const now = new Date().toISOString()
    const next = { ...flow, version: 1, updatedAt: now, createdAt: flow.createdAt || now }

    const fileName = `${safeName}.json`
    const fullPath = path.join(dir, fileName)
    await writeJsonFile(fullPath, next)
    return { success: true, fileName }
  }

  /**
   * 删除 AutoFlow 配置
   * @param {{name: string}} args
   */
  async deleteFlow(args) {
    const name = String(args?.name || '').trim()
    if (!name) throw new Error('name 不能为空')
    const dir = getAutoFlowDir()
    const fileName = `${toSafeBaseName(name)}.json`
    const fullPath = path.join(dir, fileName)
    await fs.unlink(fullPath)
    return { success: true }
  }

  /**
   * 启动 AutoFlow
   * @param {{name: string}} args
   * @param {{sendEvent: (type: string, payload: any) => void}} hooks
   */
  async runFlow(args, hooks) {
    const name = String(args?.name || '').trim()
    if (!name) throw new Error('name 不能为空')

    const flow = await this.getFlow({ name })
    validateAutoFlow(flow)

    const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const runner = new AutoFlowRunner(runId, flow, hooks)
    this.runners.set(runId, runner)

    runner._emit('created', { flowName: flow.name, tool: flow.tool })

    runner
      .run()
      .catch((e) => {
        logger.error('❌ [AutoFlowService] runner failed:', e)
      })
      .finally(() => {
        this.runners.delete(runId)
        runner._emit('disposed', {})
      })

    return { runId }
  }

  pauseRun(args) {
    const runId = String(args?.runId || '')
    const r = this.runners.get(runId)
    if (!r) throw new Error('runId 不存在')
    r.pause()
    return { success: true }
  }

  resumeRun(args) {
    const runId = String(args?.runId || '')
    const r = this.runners.get(runId)
    if (!r) throw new Error('runId 不存在')
    r.resume()
    return { success: true }
  }

  stopRun(args) {
    const runId = String(args?.runId || '')
    const r = this.runners.get(runId)
    if (!r) throw new Error('runId 不存在')
    r.stop()
    return { success: true }
  }
}

AutoFlowService.toString = () => '[class AutoFlowService]'

module.exports = {
  AutoFlowService,
  autoFlowService: new AutoFlowService()
}
