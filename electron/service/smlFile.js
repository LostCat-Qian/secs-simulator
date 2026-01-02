'use strict'

const path = require('path')
const fs = require('fs').promises
const { logger } = require('ee-core/log')
const { getBaseDir } = require('ee-core/ps')

/**
 * SML 文件管理服务
 * @class
 */
class SmlFileService {
  /**
   * 获取 SML 目录树结构
   * @returns {Array} 文件树数组
   */
  async getFileTree() {
    try {
      const smlPath = path.join(getBaseDir(), 'sml')
      logger.info('🔍 [getFileTree] Reading SML directory:', smlPath)

      const result = await this.buildFileTree(smlPath, '')
      logger.info('✅ [getFileTree] Successfully built file tree, total items:', result.length)
      logger.debug('📁 [getFileTree] File tree structure:', JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      logger.error('❌ [getFileTree] Failed to get file tree:', error)
      throw new Error(`获取文件树失败: ${error.message}`)
    }
  }

  /**
   * 递归构建文件树结构
   * @param {String} dirPath 目录路径
   * @param {String} relativePath 相对路径
   * @returns {Array} 文件树数组
   */
  async buildFileTree(dirPath, relativePath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const tree = []

    for (const entry of entries) {
      const fullEntryPath = path.join(dirPath, entry.name)
      const entryRelativePath = relativePath ? path.join(relativePath, entry.name) : entry.name

      if (entry.isDirectory()) {
        const children = await this.buildFileTree(fullEntryPath, entryRelativePath)
        tree.push({
          title: entry.name,
          key: entryRelativePath,
          isFolder: true,
          children: children
        })
      } else {
        tree.push({
          title: entry.name,
          key: entryRelativePath,
          isFolder: false
        })
      }
    }

    return tree
  }

  /**
   * 获取 SML 文件内容
   * @param {Object} args 参数对象
   * @param {String} args.filePath 文件相对路径
   * @returns {String} 文件内容
   */
  async getFileContent(args) {
    try {
      const { filePath } = args
      if (!filePath) {
        logger.error('❌ [getFileContent] File path is empty')
        throw new Error('文件路径不能为空')
      }

      const fullPath = path.join(getBaseDir(), 'sml', filePath)
      logger.info('📖 [getFileContent] Reading file:', fullPath)

      const content = await fs.readFile(fullPath, 'utf-8')
      logger.info('✅ [getFileContent] Successfully read file, length:', content.length)
      return content
    } catch (error) {
      logger.error('❌ [getFileContent] Failed to get file content:', error)
      throw new Error(`获取文件内容失败: ${error.message}`)
    }
  }

  /**
   * 保存 SML 文件内容
   * @param {Object} args 参数对象
   * @param {String} args.filePath 文件相对路径
   * @param {String} args.content 文件内容
   * @returns {Object} 操作结果
   */
  async saveSmlFile(args) {
    try {
      const { filePath, content } = args
      if (!filePath) {
        logger.error('❌ [saveSmlFile] File path is empty')
        throw new Error('文件路径不能为空')
      }
      if (content === undefined || content === null) {
        logger.error('❌ [saveSmlFile] File content is empty')
        throw new Error('文件内容不能为空')
      }

      const fullPath = path.join(getBaseDir(), 'sml', filePath)
      logger.info('💾 [saveSmlFile] Saving file:', fullPath)
      logger.debug('📝 [saveSmlFile] Content length:', content.length)

      await fs.writeFile(fullPath, content, 'utf-8')
      logger.info('✅ [saveSmlFile] File saved successfully')
      return { success: true, message: '文件保存成功' }
    } catch (error) {
      logger.error('❌ [saveSmlFile] Failed to save file:', error)
      throw new Error(`保存文件失败: ${error.message}`)
    }
  }

  /**
   * 创建 SML 文件
   * @param {Object} args 参数对象
   * @param {String} args.filePath 文件相对路径（包含文件名）
   * @param {String} args.content 文件内容（可选）
   * @returns {Object} 操作结果
   */
  async createSmlFile(args) {
    try {
      const { filePath, content = '' } = args
      if (!filePath) {
        logger.error('❌ [createSmlFile] File path is empty')
        throw new Error('文件路径不能为空')
      }

      const fullPath = path.join(getBaseDir(), 'sml', filePath)
      logger.info('➕ [createSmlFile] Creating file:', fullPath)

      // 检查文件是否已存在
      try {
        await fs.access(fullPath)
        logger.error('❌ [createSmlFile] File already exists:', fullPath)
        throw new Error('文件已存在')
      } catch (accessError) {
        if (accessError.code !== 'ENOENT') {
          throw accessError
        }
      }

      // 确保目录存在
      const dirPath = path.dirname(fullPath)
      await fs.mkdir(dirPath, { recursive: true })
      logger.debug('📁 [createSmlFile] Directory ensured:', dirPath)

      // 创建文件
      await fs.writeFile(fullPath, content, 'utf-8')
      logger.info('✅ [createSmlFile] File created successfully')
      return { success: true, message: '文件创建成功' }
    } catch (error) {
      logger.error('❌ [createSmlFile] Failed to create file:', error)
      throw new Error(`创建文件失败: ${error.message}`)
    }
  }

  async createSmlFolder(args) {
    try {
      const { folderPath } = args
      if (!folderPath) {
        logger.error('❌ [createSmlFolder] Folder path is empty')
        throw new Error('目录路径不能为空')
      }

      const fullPath = path.join(getBaseDir(), 'sml', folderPath)
      logger.info('📁 [createSmlFolder] Creating folder:', fullPath)

      try {
        const stat = await fs.stat(fullPath)
        if (stat.isDirectory()) {
          logger.error('❌ [createSmlFolder] Folder already exists:', fullPath)
          throw new Error('目录已存在')
        }
        logger.error('❌ [createSmlFolder] File with same name exists:', fullPath)
        throw new Error('同名文件已存在')
      } catch (error) {
        if (error.code && error.code !== 'ENOENT') {
          throw error
        }
      }

      await fs.mkdir(fullPath, { recursive: true })
      logger.info('✅ [createSmlFolder] Folder created successfully')
      return { success: true, message: '目录创建成功' }
    } catch (error) {
      logger.error('❌ [createSmlFolder] Failed to create folder:', error)
      throw new Error(`创建目录失败: ${error.message}`)
    }
  }

  /**
   * 删除 SML 文件
   * @param {Object} args 参数对象
   * @param {String} args.filePath 文件相对路径
   * @returns {Object} 操作结果
   */
  async deleteSmlFile(args) {
    try {
      const { filePath } = args
      if (!filePath) {
        logger.error('❌ [deleteSmlFile] File path is empty')
        throw new Error('文件路径不能为空')
      }

      const fullPath = path.join(getBaseDir(), 'sml', filePath)
      logger.info('🗑️ [deleteSmlFile] Deleting file:', fullPath)

      // 检查文件是否存在
      try {
        await fs.access(fullPath)
      } catch (accessError) {
        logger.error('❌ [deleteSmlFile] File does not exist:', fullPath)
        throw new Error('文件不存在')
      }

      // 删除文件
      await fs.unlink(fullPath)
      logger.info('✅ [deleteSmlFile] File deleted successfully')
      return { success: true, message: '文件删除成功' }
    } catch (error) {
      logger.error('❌ [deleteSmlFile] Failed to delete file:', error)
      throw new Error(`删除文件失败: ${error.message}`)
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

    logger.info('SmlFileService obj:', obj)

    return obj
  }
}
SmlFileService.toString = () => '[class SmlFileService]'

module.exports = {
  SmlFileService,
  smlFileService: new SmlFileService()
}
