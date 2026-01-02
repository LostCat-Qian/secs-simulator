'use strict'

const { logger } = require('ee-core/log')
const { smlFileService } = require('../service/smlFile')

/**
 * SML 文件管理控制器
 * @class
 */
class SmlFileController {
  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * 获取 SML 目录树结构
   */
    async getFileTree(args, event) {
      try {
        logger.info('🎯 [Controller] getFileTree called')
        const result = await smlFileService.getFileTree()
        logger.info('✅ [Controller] getFileTree success, returned items:', result.length)
        return result
      } catch (error) {
        logger.error('❌ [Controller] getFileTree failed:', error)
        throw error
      }
    }
  
    /**
     * 获取 SML 文件内容
     */
    async getFileContent(args, event) {
      try {
        logger.info('🎯 [Controller] getFileContent called with filePath:', args.filePath)
        const result = await smlFileService.getFileContent(args)
        logger.info('✅ [Controller] getFileContent success, content length:', result.length)
        return result
      } catch (error) {
        logger.error('❌ [Controller] getFileContent failed:', error)
        throw error
      }
    }
  
    /**
     * 保存 SML 文件内容
     */
    async saveSmlFile(args, event) {
      try {
        logger.info('🎯 [Controller] saveSmlFile called with filePath:', args.filePath)
        const result = await smlFileService.saveSmlFile(args)
        logger.info('✅ [Controller] saveSmlFile success')
        return result
      } catch (error) {
        logger.error('❌ [Controller] saveSmlFile failed:', error)
        throw error
      }
    }
  
    /**
     * 创建 SML 文件
     */
    async createSmlFile(args, event) {
      try {
        logger.info('🎯 [Controller] createSmlFile called with filePath:', args.filePath)
        const result = await smlFileService.createSmlFile(args)
        logger.info('✅ [Controller] createSmlFile success')
        return result
      } catch (error) {
        logger.error('❌ [Controller] createSmlFile failed:', error)
        throw error
      }
    }
  
    /**
     * 删除 SML 文件
     */
    async deleteSmlFile(args, event) {
      try {
        logger.info('🎯 [Controller] deleteSmlFile called with filePath:', args.filePath)
        const result = await smlFileService.deleteSmlFile(args)
        logger.info('✅ [Controller] deleteSmlFile success')
        return result
      } catch (error) {
        logger.error('❌ [Controller] deleteSmlFile failed:', error)
        throw error
      }
    }
  /**
   * test (保留测试方法)
   */
  async test() {
    const result = await smlFileService.test('electron')
    logger.info('service result:', result)

    return 'hello electron-egg'
  }
}
SmlFileController.toString = () => '[class SmlFileController]'

module.exports = SmlFileController
