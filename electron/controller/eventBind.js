'use strict'

const { logger } = require('ee-core/log')
const { EventBindService } = require('../service/eventBind')

/**
 * EventBind 控制器
 * 处理 EventBind 相关的文件操作
 * @class
 */
class EventBindController {
  /**
   * 创建 EventBind 文件夹
   * @param args 包含 folderPath 的参数对象
   */
  async createFolder(args, event) {
    try {
      logger.info('🎯 [EventBindController] createFolder called with:', args)
      const result = await EventBindService.createFolder(args)
      logger.info('✅ [EventBindController] createFolder success')
      return result
    } catch (error) {
      logger.error('❌ [EventBindController] createFolder failed:', error)
      throw error
    }
  }

  /**
   * 保存 EventBind SML 文件
   * @param args 包含 folderPath, fileName, content 的参数对象
   */
  async saveFile(args, event) {
    try {
      logger.info('🎯 [EventBindController] saveFile called with:', args)

      // 如果收到 files 数组（多文件模式），转发给 saveFiles 处理
      if (args.files && Array.isArray(args.files) && args.files.length > 0) {
        logger.info('💾 [EventBindController] Detected multiple files, delegating to saveFiles')
        return this.saveFiles(args, event)
      }

      const result = await EventBindService.saveFile(args)
      logger.info('✅ [EventBindController] saveFile success')
      return result
    } catch (error) {
      logger.error('❌ [EventBindController] saveFile failed:', error)
      throw error
    }
  }

  /**
   * 保存多个 EventBind SML 文件
   * @param args 包含 folderPath, files 的参数对象
   */
  async saveFiles(args, event) {
    try {
      logger.info('🎯 [EventBindController] saveFiles called with:', args)
      const result = await EventBindService.saveFiles(args)
      logger.info('✅ [EventBindController] saveFiles success')
      return result
    } catch (error) {
      logger.error('❌ [EventBindController] saveFiles failed:', error)
      throw error
    }
  }

  async generateEventBindFiles(args, event) {
    try {
      logger.info('🎯 [EventBindController] generateEventBindFiles called')
      const result = await EventBindService.generateEventBindFiles(args)
      logger.info('✅ [EventBindController] generateEventBindFiles success')
      return result
    } catch (error) {
      logger.error('❌ [EventBindController] generateEventBindFiles failed:', error)
      throw error
    }
  }
}

EventBindController.toString = () => '[class EventBindController]'

module.exports = EventBindController
