'use strict'

const { logger } = require('ee-core/log')
const path = require('path')
const fs = require('fs').promises
const { getBaseDir } = require('ee-core/ps')

class AutoReplyService {
  async test(args) {
    let obj = {
      status: 'ok',
      params: args
    }

    logger.info('AutoReplyService obj:', obj)

    return obj
  }

  async addScript(args) {
    try {
      const { tool, handlerSf, active, code } = args
      if (!tool || !handlerSf || !code) {
        throw new Error('参数不完整')
      }

      const safeTool = String(tool).replace(/[^a-zA-Z0-9_-]/g, '_')
      const safeSf = String(handlerSf).replace(/[^a-zA-Z0-9_-]/g, '_')

      let delaySeconds = Number(args.delaySeconds)
      if (!Number.isFinite(delaySeconds) || delaySeconds < 0) {
        delaySeconds = 0
      }

      const delayPart = String(Math.floor(delaySeconds))
      const activePart = active ? 'true' : 'false'

      const fileName = `${safeTool}-handler-${safeSf}-delay${delayPart}-${activePart}.js`
      const scriptsDir = path.join(getBaseDir(), 'auto-reply-scripts')
      const fullPath = path.join(scriptsDir, fileName)

      try {
        await fs.access(fullPath)
        throw new Error('脚本已存在')
      } catch (error) {
        if (error.code && error.code !== 'ENOENT') {
          throw error
        }
      }

      await fs.mkdir(scriptsDir, { recursive: true })

      const header =
        `/**\n` +
        ` * Auto reply script for ${tool} ${handlerSf}\n` +
        ` * delaySeconds: ${delayPart}\n` +
        ` * active: ${activePart}\n` +
        ` */\n`
      await fs.writeFile(fullPath, header + String(code), 'utf-8')

      logger.info('AutoReplyService addScript success:', fullPath)
      return { success: true, message: '脚本创建成功', fileName }
    } catch (error) {
      logger.error('AutoReplyService addScript failed:', error)
      throw new Error(`添加脚本失败: ${error.message}`)
    }
  }

  async getScript(args) {
    try {
      const { name } = args
      if (!name) {
        throw new Error('脚本名称不能为空')
      }

      const scriptsDir = path.join(getBaseDir(), 'auto-reply-scripts')
      const fullPath = path.join(scriptsDir, String(name))

      const content = await fs.readFile(fullPath, 'utf-8')

      const match = /^(.+)-handler-(.+)-delay(\d+)-(true|false)\.js$/.exec(String(name))
      if (!match) {
        throw new Error('脚本文件名格式不正确')
      }

      const tool = match[1]
      const sf = match[2]
      const delaySeconds = Number.parseInt(match[3], 10)
      const active = match[4] === 'true'

      return {
        name: String(name),
        tool,
        sf,
        delaySeconds: Number.isFinite(delaySeconds) && delaySeconds > 0 ? delaySeconds : 0,
        active,
        code: content
      }
    } catch (error) {
      logger.error('AutoReplyService getScript failed:', error)
      throw new Error(`获取脚本失败: ${error.message}`)
    }
  }

  async listScripts() {
    try {
      const scriptsDir = path.join(getBaseDir(), 'auto-reply-scripts')
      let files = []

      try {
        files = await fs.readdir(scriptsDir)
      } catch (error) {
        if (error.code === 'ENOENT') {
          return []
        }
        throw error
      }

      const result = []
      for (const name of files) {
        const match = /^(.+)-handler-(.+)-delay(\d+)-(true|false)\.js$/.exec(name)
        if (!match) {
          continue
        }

        const tool = match[1]
        const sf = match[2]
        const delaySeconds = Number.parseInt(match[3], 10)
        const active = match[4] === 'true'

        result.push({
          name,
          tool,
          sf,
          delaySeconds: Number.isFinite(delaySeconds) && delaySeconds > 0 ? delaySeconds : 0,
          active
        })
      }

      return result
    } catch (error) {
      logger.error('AutoReplyService listScripts failed:', error)
      throw new Error(`获取脚本列表失败: ${error.message}`)
    }
  }

  async updateScript(args) {
    try {
      const { originalName, tool, handlerSf, active, code } = args
      if (!originalName) {
        throw new Error('原始脚本名称不能为空')
      }
      if (!tool || !handlerSf || !code) {
        throw new Error('参数不完整')
      }

      const safeTool = String(tool).replace(/[^a-zA-Z0-9_-]/g, '_')
      const safeSf = String(handlerSf).replace(/[^a-zA-Z0-9_-]/g, '_')

      let delaySeconds = Number(args.delaySeconds)
      if (!Number.isFinite(delaySeconds) || delaySeconds < 0) {
        delaySeconds = 0
      }

      const delayPart = String(Math.floor(delaySeconds))
      const activePart = active ? 'true' : 'false'

      const newFileName = `${safeTool}-handler-${safeSf}-delay${delayPart}-${activePart}.js`
      const scriptsDir = path.join(getBaseDir(), 'auto-reply-scripts')
      const originalPath = path.join(scriptsDir, String(originalName))
      const newPath = path.join(scriptsDir, newFileName)

      await fs.mkdir(scriptsDir, { recursive: true })

      if (String(originalName) !== newFileName) {
        try {
          await fs.access(newPath)
          throw new Error('目标脚本已存在')
        } catch (error) {
          if (error.code && error.code !== 'ENOENT') {
            throw error
          }
        }
      }

      await fs.writeFile(newPath, String(code), 'utf-8')

      if (String(originalName) !== newFileName) {
        try {
          await fs.unlink(originalPath)
        } catch (error) {
          if (!error.code || error.code !== 'ENOENT') {
            throw error
          }
        }
      }

      logger.info('AutoReplyService updateScript success:', {
        originalName: String(originalName),
        newFileName
      })

      return { success: true, message: '脚本更新成功', fileName: newFileName }
    } catch (error) {
      logger.error('AutoReplyService updateScript failed:', error)
      throw new Error(`更新脚本失败: ${error.message}`)
    }
  }

  async deleteScript(args) {
    try {
      const { name } = args
      if (!name) {
        throw new Error('脚本名称不能为空')
      }
      const scriptsDir = path.join(getBaseDir(), 'auto-reply-scripts')
      const fullPath = path.join(scriptsDir, String(name))

      await fs.unlink(fullPath)
      logger.info('AutoReplyService deleteScript success:', fullPath)
      return { success: true, message: '脚本删除成功' }
    } catch (error) {
      logger.error('AutoReplyService deleteScript failed:', error)
      throw new Error(`删除脚本失败: ${error.message}`)
    }
  }

  async isEnabled() {
    return { enabled: true }
  }
}
AutoReplyService.toString = () => '[class AutoReplyService]'

module.exports = {
  AutoReplyService,
  autoReplyService: new AutoReplyService()
}
