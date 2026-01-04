'use strict'

const { logger } = require('ee-core/log')
const { engineService } = require('../service/engine')

/**
 * engine
 * @class
 */
class EngineController {
  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * 获取所有引擎配置
   */
  async getConfig(args, event) {
    try {
      logger.info('🎯 [Controller] getConfig called')
      const result = await engineService.getConfig()
      logger.info(`✅ [Controller] getConfig success, returned ${result.length} configs`)
      return result
    } catch (error) {
      logger.error('❌ [Controller] getConfig failed:', error)
      throw error
    }
  }

  async listSerialPorts(args, event) {
    try {
      logger.info('🎯 [Controller] listSerialPorts called')
      const result = await engineService.listSerialPorts()
      logger.info(`✅ [Controller] listSerialPorts success, returned ${result.length} ports`)
      return result
    } catch (error) {
      logger.error('❌ [Controller] listSerialPorts failed:', error)
      throw error
    }
  }

  /**
   * 删除引擎配置
   */
  async delete(args, event) {
    try {
      logger.info('🎯 [Controller] delete called with fileName:', args.fileName)
      const result = await engineService.delete(args)
      logger.info('✅ [Controller] delete success')
      return result
    } catch (error) {
      logger.error('❌ [Controller] delete failed:', error)
      throw error
    }
  }

  /**
   * 启动引擎连接
   */
  async start(args, event) {
    try {
      logger.info('🎯 [Controller] start called with engine name:', args?.config?.name)
      const result = await engineService.start(args, event)
      logger.info('✅ [Controller] start success')
      return result
    } catch (error) {
      logger.error('❌ [Controller] start failed:', error)
      throw error
    }
  }

  async sendMessageFromFile(args, event) {
    try {
      logger.info(
        '🎯 [Controller] sendMessageFromFile called with engine name and file:',
        args?.name,
        args?.filePath
      )
      const result = await engineService.sendMessageFromFile(args, event)
      logger.info('✅ [Controller] sendMessageFromFile success')
      return result
    } catch (error) {
      logger.error('❌ [Controller] sendMessageFromFile failed:', error)
      throw error
    }
  }

  /**
   * 停止引擎连接
   */
  async stop(args, event) {
    try {
      logger.info('🎯 [Controller] stop called with engine name:', args?.name)
      const result = await engineService.stop(args, event)
      logger.info('✅ [Controller] stop success')
      return result
    } catch (error) {
      logger.error('❌ [Controller] stop failed:', error)
      throw error
    }
  }

  /**
   * 保存引擎配置
   */
  async saveConfig(args, event) {
    try {
      logger.info('🎯 [Controller] saveConfig called with engine name:', args.config?.name)
      const result = await engineService.saveConfig(args)
      logger.info('✅ [Controller] saveConfig success')
      return result
    } catch (error) {
      logger.error('❌ [Controller] saveConfig failed:', error)
      throw error
    }
  }

  /**
   * test (保留测试方法)
   */
  async test() {
    const result = await engineService.test('electron')
    logger.info('service result:', result)

    return 'hello electron-egg'
  }
}
EngineController.toString = () => '[class EngineController]'

module.exports = EngineController
