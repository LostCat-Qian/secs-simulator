'use strict'

const path = require('path')
const fs = require('fs').promises
const { logger } = require('ee-core/log')
const { getBaseDir } = require('ee-core/ps')

/**
 * 引擎服务
 * @class
 */
class EngineService {
  /**
   * 获取所有引擎配置
   * @returns {Array} 引擎配置数组，每个元素包含 fileName 和 config
   */
  async getConfig() {
    try {
      const enginesPath = path.join(getBaseDir(), 'engines')
      logger.info('🔍 [getConfig] Reading engines directory:', enginesPath)

      // 确保目录存在
      await fs.mkdir(enginesPath, { recursive: true })

      // 读取目录中的所有文件
      const files = await fs.readdir(enginesPath)
      const jsonFiles = files.filter(file => file.endsWith('.json'))

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
        message: '引擎配置保存成功',
        fileName: fileName
      }
    } catch (error) {
      logger.error('❌ [saveConfig] Failed to save engine config:', error)
      throw new Error(`保存引擎配置失败: ${error.message}`)
    }
  }

  /**
   * test (保留测试方法)
   */
  async test(args) {
    let obj = {
      status: 'ok',
      params: args
    }

    logger.info('EngineService obj:', obj)

    return obj
  }
}
EngineService.toString = () => '[class EngineService]'

module.exports = {
  EngineService,
  engineService: new EngineService()
}
