'use strict'

const path = require('path')
const fs = require('fs').promises
const { logger } = require('ee-core/log')
const { getBaseDir } = require('ee-core/ps')
const {
  HsmsActiveCommunicator,
  HsmsPassiveCommunicator,
  Secs1SerialCommunicator,
  Secs1OnTcpIpActiveCommunicator,
  Secs1OnTcpIpPassiveCommunicator,
  L,
  SmlParser
} = require('secs4js')
const { SerialPort } = require('serialport')
const { smlFileService } = require('./smlFile')
const { autoReplyService } = require('./autoReply')
const { getExtraResourceDir } = require('./pathHelper')

const engineInstances = new Map()

class EngineService {
  async listSerialPorts() {
    try {
      logger.info('🔍 [listSerialPorts] Listing available serial ports')
      const ports = await SerialPort.list()
      logger.debug(`📌 [listSerialPorts] Found ${ports.length} ports`)

      return ports.map((port) => ({
        path: port.path || '',
        friendlyName: port.friendlyName || port.manufacturer || '',
        vendorId: port.vendorId || '',
        productId: port.productId || ''
      }))
    } catch (error) {
      logger.error('❌ [listSerialPorts] Failed to list serial ports:', error)
      throw new Error(`获取串口列表失败: ${error.message}`)
    }
  }

  async getConfig() {
    try {
      const enginesPath = getExtraResourceDir('engines')
      logger.info('🔍 [getConfig] Reading engines directory:', enginesPath)

      // 确保目录存在
      await fs.mkdir(enginesPath, { recursive: true })

      // 读取目录中的所有文件
      const files = await fs.readdir(enginesPath)
      const jsonFiles = files.filter((file) => file.endsWith('.json'))

      logger.debug('📁 [getConfig] Found JSON files:', jsonFiles.length)

      const configs = []

      // 读取每个 JSON 文件
      for (const fileName of jsonFiles) {
        try {
          const filePath = path.join(enginesPath, fileName)
          const content = await fs.readFile(filePath, 'utf-8')
          const config = JSON.parse(content)

          configs.push({
            fileName: fileName,
            config: config
          })

          logger.debug(`✅ [getConfig] Loaded config: ${fileName}`)
        } catch (fileError) {
          logger.error(`❌ [getConfig] Failed to read ${fileName}:`, fileError.message)
          // 继续处理其他文件，不中断整个流程
        }
      }

      logger.info(`✅ [getConfig] Successfully loaded ${configs.length} engine configs`)
      return configs
    } catch (error) {
      logger.error('❌ [getConfig] Failed to get engine configs:', error)
      throw new Error(`获取引擎配置失败: ${error.message}`)
    }
  }

  /**
   * 启动连接
   * @param {{ config: EngineConfig }} args - 包含引擎配置的对象
   * @param {*} event - Electron 事件对象，用于发送日志
   * @returns {Promise<{ success: boolean, message: string, name: string }>} 启动结果
   */
  async start(args, event) {
    const { config } = args || {}
    if (!config || !config.name) {
      logger.error('❌ [start] Config or name is missing')
      throw new Error('启动引擎需要完整配置并包含 name 字段')
    }

    const key = config.name
    if (engineInstances.has(key)) {
      logger.warn('⚠️ [start] Engine already started, skipping:', key)
      return { success: true, message: `${config.name} already started`, name: key }
    }

    try {
      let instance = null
      const timeoutConfig = {
        timeoutT1: config.timeoutT1 || 10,
        timeoutT2: config.timeoutT2 || 45,
        timeoutT3: config.timeoutT3 || 180,
        timeoutT4: config.timeoutT4 || 120,
        timeoutT5: config.timeoutT5 || 10,
        timeoutT6: config.timeoutT6 || 10,
        timeoutT7: config.timeoutT7 || 10,
        timeoutT8: config.timeoutT8 || 10
      }
      const logConfig = {
        enabled: true, // Whether to enable logging
        console: true, // Whether to output logs to console
        baseDir: `${getBaseDir()}/secs-logs/${config.name}`, // Path for log storage
        retentionDays: 30, // Number of days to retain logs
        detailLevel: 'trace', // Level for DETAIL logs
        secs2Level: 'info', // Level for SECS-II logs
        maxHexBytes: 65536 // Maximum number of hex bytes to record
      }

      switch (config.type) {
        case 'HSMS':
          const isEquip = String(config.simulate || '') === 'Equipment'
          if (isEquip) {
            instance = new HsmsPassiveCommunicator({
              ip: config.ip || '0.0.0.0',
              port: config.port,
              deviceId: config.deviceId,
              isEquip: true,
              name: config.name,
              log: logConfig,
              ...timeoutConfig
            })
          } else {
            instance = new HsmsActiveCommunicator({
              name: config.name,
              ip: config.ip || '127.0.0.1',
              port: config.port,
              deviceId: config.deviceId,
              isEquip: false,
              log: logConfig,
              ...timeoutConfig
            })
          }
          break
        case 'SECS-I':
          instance = new Secs1SerialCommunicator({
            name: config.name,
            path: config.path || '',
            baudRate: config.baudRate || 9600,
            deviceId: config.deviceId,
            isEquip: config.simulate === 'Equipment',
            log: logConfig,
            ...timeoutConfig
          })
          break
        case 'SECS-I-TCP':
          if (isEquip) {
            instance = new Secs1OnTcpIpPassiveCommunicator({
              name: config.name,
              ip: config.ip || '127.0.0.1',
              port: config.port,
              deviceId: config.deviceId,
              isEquip: true,
              log: logConfig,
              ...timeoutConfig
            })
          } else {
            instance = new Secs1OnTcpIpActiveCommunicator({
              name: config.name,
              ip: config.ip || '127.0.0.1',
              port: config.port,
              deviceId: config.deviceId,
              isEquip: false,
              log: logConfig,
              ...timeoutConfig
            })
          }
          break
        default:
          logger.error('❌ [start] Unsupported engine type:', config.type)
          throw new Error(`不支持的引擎类型: ${config.type}`)
      }

      if (event && event.sender) {
        event.sender.send('engine/log', {
          name: key,
          level: 'INFO',
          type: 'start',
          message: `${config.name} starting...`
        })
      }

      instance.on('connected', () => {
        logger.info(`🔌 [${key}] connected`)
        if (event && event.sender) {
          event.sender.send('engine/log', {
            name: key,
            level: 'INFO',
            type: 'connected',
            message: `${config.name} connected`
          })
        }
      })

      instance.on('disconnected', () => {
        logger.info(`🔌 [${key}] disconnected`)
        if (event && event.sender) {
          event.sender.send('engine/log', {
            name: key,
            level: 'INFO',
            type: 'disconnected',
            message: `${config.name} disconnected, wait for next connection...`
          })
        }
      })

      instance.on('selected', () => {
        logger.info(`✅ [${key}] HSMS selected`)
        if (event && event.sender) {
          event.sender.send('engine/log', {
            name: key,
            level: 'INFO',
            type: 'selected',
            message: `${config.name} selected (ready)`
          })
        }
      })

      instance.on('message', (msg) => {
        ;(async () => {
          try {
            const sml = typeof msg.toSml === 'function' ? msg.toSml() : String(msg)
            const receivedMsg = `Received Message: DeviceId=${msg.deviceId}, SystemBytes=${msg.systemBytes}, Data=\n${sml}`
            logger.info(`📨 [${key}] message: ${receivedMsg}`)
            if (event && event.sender) {
              event.sender.send('engine/log', {
                name: key,
                level: 'INFO',
                type: 'message',
                message: receivedMsg
              })
            }

            // 获取所有 SML 文件路径
            const filePaths = await smlFileService.getAllFilePaths()

            // 优先级 1: Script - 查找匹配的脚本
            const script = await autoReplyService.findScript({
              tool: config.name,
              sf: `S${msg.stream}F${msg.func}`,
              active: true
            })

            if (script && script.code) {
              try {
                const funcExcutor = require('./funcExcutor')
                const smlPath = await funcExcutor.execFunction(script.code, [msg, filePaths])

                if (smlPath && typeof smlPath === 'string') {
                  const replySmlContent = await smlFileService.getFileContent({ filePath: smlPath })
                  const replyMsg = SmlParser.parse(replySmlContent)
                  await instance.reply(msg, replyMsg.stream, replyMsg.func, replyMsg.body)
                  if (event && event.sender) {
                    event.sender.send('engine/log', {
                      name: key,
                      level: 'INFO',
                      type: 'message',
                      message: `[Action Script Reply] Reply Message: DeviceId=${msg.deviceId}, SystemBytes=${
                        msg.systemBytes
                      }, Data=\n${replyMsg.toSml()}`
                    })
                  }
                  return
                }
              } catch (scriptError) {
                logger.error(`❌ [${key}] Script execution failed:`, scriptError)
                if (event && event.sender) {
                  event.sender.send('engine/log', {
                    name: key,
                    level: 'ERROR',
                    type: 'error',
                    message: `Script execution failed: ${scriptError.message}`
                  })
                }
              }
            }

            // 优先级 2: File - 查找 SML 消息文件
            const willReplySF = `S${msg.stream}F${msg.func + 1}`
            const willReplyMsgList = filePaths.filter((filePath) => filePath.includes(willReplySF))
            console.log(JSON.stringify(willReplyMsgList))

            if (willReplyMsgList.length !== 0) {
              const willReplySml = await smlFileService.getFileContent({ filePath: willReplyMsgList[0] })
              const willReplyMsg = SmlParser.parse(willReplySml)
              await instance.reply(msg, willReplyMsg.stream, willReplyMsg.func, willReplyMsg.body)
              if (event && event.sender) {
                event.sender.send('engine/log', {
                  name: key,
                  level: 'INFO',
                  type: 'message',
                  message: `[Action File Reply] Reply Message: DeviceId=${msg.deviceId}, SystemBytes=${
                    msg.systemBytes
                  }, Data=\n${willReplyMsg.toSml()}`
                })
              }
              return
            }

            // 优先级 3: Auto - 默认回复 L()
            if (msg.func % 2 !== 0) {
              const replySml = L()
              await instance.reply(msg, msg.stream, msg.func + 1, replySml)
              if (event && event.sender) {
                event.sender.send('engine/log', {
                  name: key,
                  level: 'INFO',
                  type: 'message',
                  message: `[Action Auto Reply] Reply Message: DeviceId=${msg.deviceId}, SystemBytes=${
                    msg.systemBytes
                  }, Data=\nS${msg.stream}F${msg.func + 1}\n${replySml.toSml()}.`
                })
              }
            }
          } catch (error) {
            logger.error(`❌ [${key}] Message handling failed:`, error)
            if (event && event.sender) {
              event.sender.send('engine/log', {
                name: key,
                level: 'ERROR',
                type: 'error',
                message: `Message handling failed: ${error.message}`
              })
            }
          }
        })()
      })

      await instance.open()
      engineInstances.set(key, instance)

      logger.info(`✅ [start] Engine started: ${key}`)

      return {
        success: true,
        message: `${config.name} start successfully`,
        name: key
      }
    } catch (error) {
      logger.error('❌ [start] Failed to start engine:', error)
      throw new Error(`${config.name} start failed: ${error.message}`)
    }
  }

  async sendMessageFromFile(args, event) {
    const { name, filePath, waitReply } = args || {}
    if (!name || !filePath) {
      logger.error('❌ [sendMessageFromFile] Name or filePath is empty')
      throw new Error('发送消息需要引擎名称和文件路径')
    }

    const instance = engineInstances.get(name)
    if (!instance) {
      logger.error('❌ [sendMessageFromFile] Engine instance not found:', name)
      throw new Error(`引擎未启动: ${name}`)
    }

    if (typeof instance.send !== 'function') {
      logger.error('❌ [sendMessageFromFile] Engine instance does not support send:', name)
      throw new Error('当前引擎实例不支持发送消息')
    }

    try {
      const smlContent = await smlFileService.getFileContent({ filePath })
      const msg = SmlParser.parse(smlContent)

      const expectReply = typeof waitReply === 'boolean' ? waitReply : msg.func % 2 !== 0

      if (event && event.sender) {
        event.sender.send('engine/log', {
          name,
          level: 'INFO',
          type: 'message',
          message: `[Active Send] Send Message: S${msg.stream}F${msg.func}\n${msg.toSml()}`
        })
      }

      const reply = await instance.send(msg.stream, msg.func, expectReply, msg.body)

      if (reply && event && event.sender) {
        event.sender.send('engine/log', {
          name,
          level: 'INFO',
          type: 'message',
          message: `[Active Send Reply] Reply Message: S${reply.stream}F${reply.func}\n${reply.toSml()}`
        })
      }

      logger.info(
        `✅ [sendMessageFromFile] Message sent from file "${filePath}" by engine "${name}", expectReply=${expectReply}`
      )

      return {
        success: true,
        name,
        filePath,
        expectReply,
        hasReply: !!reply,
        replySml: reply ? reply.toSml() : null
      }
    } catch (error) {
      logger.error('❌ [sendMessageFromFile] Failed to send message from file:', error)

      if (event && event.sender) {
        event.sender.send('engine/log', {
          name,
          level: 'ERROR',
          type: 'error',
          message: `[Active Send Error] Send message from file "${filePath}" failed: ${error.message}`
        })
      }

      throw new Error(`发送消息失败: ${error.message}`)
    }
  }

  async stop(args, event) {
    const { name } = args || {}
    if (!name) {
      logger.error('❌ [stop] Name is empty')
      throw new Error(`Engine stop failed: name is empty`)
    }

    const instance = engineInstances.get(name)
    if (!instance) {
      logger.warn('⚠️ [stop] Engine instance not found:', name)
      return { success: true, message: `Engine stopped`, name }
    }

    let closeError = null

    if (typeof instance.removeAllListeners === 'function') {
      instance.removeAllListeners('connected')
      instance.removeAllListeners('disconnected')
      instance.removeAllListeners('selected')
      instance.removeAllListeners('message')
    }

    if (typeof instance.close === 'function') {
      try {
        await instance.close()
      } catch (error) {
        const isServerNotRunningError =
          error && (error.code === 'ERR_SERVER_NOT_RUNNING' || /Server is not running/i.test(error.message || ''))

        if (isServerNotRunningError) {
          logger.warn('⚠️ [stop] Instance already stopped or server not running, treating as success')
        } else {
          logger.error('❌ [stop] Failed to stop engine:', error)
          closeError = error
        }
      }
    }

    engineInstances.delete(name)

    logger.info(`✅ [stop] Engine stopped: ${name}`)

    if (event && event.sender) {
      event.sender.send('engine/log', {
        name,
        level: 'INFO',
        type: 'stopped',
        message: `Engine stopped`
      })
    }

    if (closeError) {
      throw new Error(`Engine stop failed: ${closeError.message}`)
    }

    return {
      success: true,
      message: `Engine stopped successfully`,
      name
    }
  }
  /**
   * 删除引擎配置
   * @param {Object} args 参数对象
   * @param {String} args.fileName 文件名
   * @returns {Object} 操作结果
   */
  async delete(args) {
    try {
      const { fileName } = args

      if (!fileName) {
        logger.error('❌ [delete] File name is empty')
        throw new Error('文件名不能为空')
      }

      // 验证文件名格式
      if (!fileName.endsWith('.json')) {
        logger.error('❌ [delete] Invalid file name format:', fileName)
        throw new Error('文件名必须以 .json 结尾')
      }

      const filePath = path.join(getBaseDir(), 'engines', fileName)
      logger.info('🗑️ [delete] Deleting engine config:', filePath)

      // 检查文件是否存在
      try {
        await fs.access(filePath)
      } catch (accessError) {
        logger.error('❌ [delete] File does not exist:', filePath)
        throw new Error('引擎配置文件不存在')
      }

      // 删除文件
      await fs.unlink(filePath)
      logger.info(`✅ [delete] Successfully deleted engine config: ${fileName}`)

      return {
        success: true,
        message: '引擎配置删除成功',
        fileName: fileName
      }
    } catch (error) {
      logger.error('❌ [delete] Failed to delete engine config:', error)
      throw new Error(`删除引擎配置失败: ${error.message}`)
    }
  }

  /**
   * 保存引擎配置
   * @param {Object} args 参数对象
   * @param {Object} args.config 配置对象
   * @returns {Object} 操作结果
   */
  async saveConfig(args) {
    try {
      const { config } = args

      if (!config) {
        logger.error('❌ [saveConfig] Config is empty')
        throw new Error('配置内容不能为空')
      }

      // 验证配置对象的必要字段
      if (!config.name) {
        logger.error('❌ [saveConfig] Config missing required field: name')
        throw new Error('配置对象必须包含 name 字段')
      }

      // 从 config.name 自动生成文件名
      const fileName = `${config.name}.json`
      const filePath = path.join(getBaseDir(), 'engines', fileName)
      logger.info('💾 [saveConfig] Saving engine config:', filePath)
      logger.debug('📝 [saveConfig] Engine name:', config.name)

      // 确保目录存在
      const enginesPath = path.dirname(filePath)
      await fs.mkdir(enginesPath, { recursive: true })

      // 格式化并保存 JSON
      const jsonContent = JSON.stringify(config, null, 2)
      await fs.writeFile(filePath, jsonContent, 'utf-8')

      logger.info(`✅ [saveConfig] Successfully saved engine config: ${fileName}`)

      return {
        success: true,
        message: `Engine config saved successfully`,
        fileName: fileName
      }
    } catch (error) {
      logger.error('❌ [saveConfig] Failed to save engine config:', error)
      throw new Error(`Engine config save failed: ${error.message}`)
    }
  }
}

// 暴露给auto-reply脚本使用的方法，通过文件路径获取SECS SML消息对象
globalThis['getMsgByFilePath'] = async (filePath) => {
  logger.info('[getMsgByFilePath] from script: ', filePath)
  const smlDir = getExtraResourceDir('sml')
  const fullPath = path.join(smlDir, filePath)
  const smlFileContent = await fs.readFile(fullPath, 'utf-8')
  const secsMsgObj = SmlParser.parse(smlFileContent)
  logger.info('[getMsgByFilePath] secsMsgObj SML: ', secsMsgObj.toSml())
  return secsMsgObj
}

EngineService.toString = () => '[class EngineService]'

module.exports = {
  EngineService,
  engineService: new EngineService()
}
