'use strict'

const { logger } = require('ee-core/log')
const { defineLinkService } = require('../service/defineLink')

/**
 * DefineLink 控制器
 * 处理 DefineLink 相关的文件操作
 * @class
 */
class DefineLinkController {
  /**
   * 创建 DefineLink 文件夹
   * @param args 包含 folderPath 的参数对象
   */
  async createFolder(args, event) {
    try {
      logger.info('🎯 [DefineLinkController] createFolder called with:', args)
      const result = await defineLinkService.createFolder(args)
      logger.info('✅ [DefineLinkController] createFolder success')
      return result
    } catch (error) {
      logger.error('❌ [DefineLinkController] createFolder failed:', error)
      throw error
    }
  }

  /**
    * 保存 DefineLink SML 文件
    * @param args 包含 folderPath, fileName, content 的参数对象
    */
  async saveFile(args, event) {
    try {
      logger.info('🎯 [DefineLinkController] saveFile called with:', args)
      
      // 如果收到 files 数组（多文件模式），转发给 saveFiles 处理
      if (args.files && Array.isArray(args.files) && args.files.length > 0) {
        logger.info('💾 [DefineLinkController] Detected multiple files, delegating to saveFiles')
        return this.saveFiles(args, event)
      }
      
      const result = await defineLinkService.saveFile(args)
      logger.info('✅ [DefineLinkController] saveFile success')
      return result
    } catch (error) {
      logger.error('❌ [DefineLinkController] saveFile failed:', error)
      throw error
    }
  }

  /**
    * 保存多个 DefineLink SML 文件
    * @param args 包含 folderPath, files 的参数对象
    */
  async saveFiles(args, event) {
    try {
      logger.info('🎯 [DefineLinkController] saveFiles called with:', args)
      const result = await defineLinkService.saveFiles(args)
      logger.info('✅ [DefineLinkController] saveFiles success')
      return result
    } catch (error) {
      logger.error('❌ [DefineLinkController] saveFiles failed:', error)
      throw error
    }
  }

  async generateEventBindFiles(args, event) {
    try {
      logger.info('🎯 [DefineLinkController] generateEventBindFiles called')
      const result = await defineLinkService.generateEventBindFiles(args)
      logger.info('✅ [DefineLinkController] generateEventBindFiles success')
      return result
    } catch (error) {
      logger.error('❌ [DefineLinkController] generateEventBindFiles failed:', error)
      throw error
    }
  }
}

DefineLinkController.toString = () => '[class DefineLinkController]'

module.exports = DefineLinkController
