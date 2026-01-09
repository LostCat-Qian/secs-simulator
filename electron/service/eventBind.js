'use strict'

const path = require('path')
const fs = require('fs').promises
const { logger } = require('ee-core/log')
const { getExtraResourceDir } = require('./pathHelper')
const { L, U1, U2, U4, BOOLEAN, SecsMessage, SmlParser } = require('secs4js')
const toml = require('toml')

/**
 * EventBind 服务
 * 处理 EventBind 相关的文件操作
 * @class
 */
class EventBindService {
  /**
   * 获取 EventBind 基础路径
   * @returns {string} EventBind 文件夹的完整路径
   */
  getEventBindPath() {
    const smlPath = getExtraResourceDir('sml')
    return path.join(smlPath, 'EventBind')
  }

  /**
   * 创建 EventBind 文件夹
   * @param {Object} args 参数对象
   * @param {String} args.folderPath 文件夹名称（如 EventBind_2501081200）
   * @returns {Object} 操作结果
   */
  async createFolder(args) {
    try {
      const { folderPath } = args
      if (!folderPath) {
        logger.error('❌ [EventBindService] Folder path is empty')
        throw new Error('文件夹路径不能为空')
      }

      const EventBindPath = this.getEventBindPath()
      const fullPath = path.join(EventBindPath, folderPath)
      logger.info('📁 [EventBindService] Creating folder:', fullPath)

      // 检查目录是否已存在
      try {
        const stat = await fs.stat(fullPath)
        if (stat.isDirectory()) {
          logger.warn('⚠️ [EventBindService] Folder already exists:', fullPath)
          return { success: true, message: '文件夹已存在', path: fullPath }
        }
        logger.error('❌ [EventBindService] File with same name exists:', fullPath)
        throw new Error('同名文件已存在')
      } catch (error) {
        if (error.code && error.code !== 'ENOENT') {
          throw error
        }
      }

      // 创建目录
      await fs.mkdir(fullPath, { recursive: true })
      logger.info('✅ [EventBindService] Folder created successfully:', fullPath)
      return { success: true, message: '目录创建成功', path: fullPath }
    } catch (error) {
      logger.error('❌ [EventBindService] Failed to create folder:', error)
      throw new Error(`创建目录失败: ${error.message}`)
    }
  }

  /**
   * 保存 EventBind SML 文件
   * @param {Object} args 参数对象
   * @param {String} args.folderPath 文件夹名称
   * @param {String} [args.fileName] 文件名（单文件模式）
   * @param {String} [args.content] 文件内容（单文件模式）
   * @param {Array} [args.files] 文件数组（多文件模式，每个包含 name 和 content）
   * @returns {Object} 操作结果
   */
  async saveFile(args) {
    try {
      const { folderPath, fileName, content, files } = args
      if (!folderPath) {
        logger.error('❌ [EventBindService] Folder path is empty')
        throw new Error('文件夹路径不能为空')
      }

      // 如果收到 files 数组（多文件模式），转发给 saveFiles 处理
      if (files && Array.isArray(files) && files.length > 0) {
        logger.info('💾 [EventBindService] Detected multiple files, delegating to saveFiles')
        return this.saveFiles({ folderPath, files })
      }

      // 单文件模式验证
      if (!fileName) {
        logger.error('❌ [EventBindService] File name is empty')
        throw new Error('文件名不能为空')
      }
      if (content === undefined || content === null) {
        logger.error('❌ [EventBindService] File content is empty')
        throw new Error('文件内容不能为空')
      }

      const EventBindPath = this.getEventBindPath()
      const folderFullPath = path.join(EventBindPath, folderPath)
      const fileFullPath = path.join(folderFullPath, fileName)

      logger.info('💾 [EventBindService] Saving file:', fileFullPath)

      // 确保目录存在
      await fs.mkdir(folderFullPath, { recursive: true })

      // 保存文件
      await fs.writeFile(fileFullPath, content, 'utf-8')
      logger.info('✅ [EventBindService] File saved successfully:', fileName)
      return { success: true, message: '文件保存成功', filePath: fileFullPath }
    } catch (error) {
      logger.error('❌ [EventBindService] Failed to save file:', error)
      throw new Error(`保存文件失败: ${error.message}`)
    }
  }

  /**
   * 保存多个 EventBind 文件
   * @param {Object} args 参数对象
   * @param {String} args.folderPath 文件夹名称
   * @param {Array} args.files 文件数组，每个包含 name 和 content
   * @returns {Object} 操作结果
   */
  async saveFiles(args) {
    try {
      const { folderPath, files } = args
      if (!folderPath) {
        logger.error('❌ [EventBindService] Folder path is empty')
        throw new Error('文件夹路径不能为空')
      }
      if (!files || files.length === 0) {
        logger.error('❌ [EventBindService] No files to save')
        throw new Error('没有要保存的文件')
      }

      const EventBindPath = this.getEventBindPath()
      const folderFullPath = path.join(EventBindPath, folderPath)

      logger.info('💾 [EventBindService] Saving files to folder:', folderFullPath)

      // 确保目录存在
      await fs.mkdir(folderFullPath, { recursive: true })

      // 保存所有文件
      const savedFiles = []
      for (const file of files) {
        const fileFullPath = path.join(folderFullPath, file.name)
        await fs.writeFile(fileFullPath, file.content, 'utf-8')
        savedFiles.push(file.name)
        logger.info('✅ [EventBindService] Saved file:', file.name)
      }

      logger.info('✅ [EventBindService] All files saved successfully:', savedFiles)
      return {
        success: true,
        message: `成功保存 ${savedFiles.length} 个文件`,
        folderPath: folderPath,
        files: savedFiles
      }
    } catch (error) {
      logger.error('❌ [EventBindService] Failed to save files:', error)
      throw new Error(`保存文件失败: ${error.message}`)
    }
  }

  /**
   * 生成所有6个 EventBind SML 文件内容
   * @param {Object} args 参数对象
   * @param {String} args.tomlContent TOML 格式的内容
   * @returns {Object} 包含6个文件内容的对象
   */
  async generateEventBindFiles(args) {
    try {
      const { tomlContent } = args

      if (!tomlContent) {
        logger.error('❌ [EventBindService] TOML content is empty')
        throw new Error('TOML内容不能为空')
      }

      const parsed = toml.parse(tomlContent)

      const ceidRptidBinding = parsed.CEID_RPTID_BINDING || {}
      const rptidCeidBinding = parsed.RPTID_CEID_BINDING || {}

      logger.info('CEID_RPTID_BINDING:', ceidRptidBinding)
      logger.info('RPTID_CEID_BINDING:', rptidCeidBinding)

      const files = {}

      // 01_S2F37_DisableAllEvents.txt
      const s2f37DisableMsg = new SecsMessage(2, 37, true, L(BOOLEAN(false), L()))
      files.s2f37DisableAllEvents = s2f37DisableMsg.toSml()
      logger.debug('✅ [EventBindService] Generated: 01_S2F37_DisableAllEvents.txt')

      // 02_S2F35_DisableLink.txt
      const ceidRptidBindingCeids = Object.keys(ceidRptidBinding)
      if (ceidRptidBindingCeids.length > 0) {
        const ceidLinkItems = ceidRptidBindingCeids.map((ceid) => L(U4(ceid), L()))
        const s2f35DisableMsg = new SecsMessage(2, 35, true, L(U4(0), L(...ceidLinkItems)))
        files.s2f35DisableLink = s2f35DisableMsg.toSml()
      } else {
        const s2f35DisableMsg = new SecsMessage(2, 35, true, L(U4(0), L()))
        files.s2f35DisableLink = s2f35DisableMsg.toSml()
      }
      logger.debug('✅ [EventBindService] Generated: 02_S2F35_DisableLink.txt')

      // 03_S2F33_DisableReport.txt
      const rptidCeidBindingRptids = Object.keys(rptidCeidBinding)
      if (rptidCeidBindingRptids.length > 0) {
        const rptidDisableItems = rptidCeidBindingRptids.map((rptid) => {
          return L(U4(rptid), L())
        })
        const s2f33DisableMsg = new SecsMessage(2, 33, true, L(U4(0), L(...rptidDisableItems)))
        files.s2f33DisableReport = s2f33DisableMsg.toSml()
      } else {
        const s2f33DisableMsg = new SecsMessage(2, 33, true, L(U4(0), L()))
        files.s2f33DisableReport = s2f33DisableMsg.toSml()
      }
      logger.debug('✅ [EventBindService] Generated: 03_S2F33_DisableReport.txt')

      // 04_S2F33_DefineReport.txt
      if (rptidCeidBindingRptids.length > 0) {
        const rptidDefineItems = rptidCeidBindingRptids.map((rptid) => {
          const ceidList = rptidCeidBinding[rptid]
          if (ceidList && ceidList.length > 0) {
            return L(U4(rptid), L(...ceidList.map((ceid) => U4(ceid))))
          }
          return L(U4(rptid), L())
        })
        const s2f33DefineMsg = new SecsMessage(2, 33, true, L(U4(0), L(...rptidDefineItems)))
        files.s2f33DefineReport = s2f33DefineMsg.toSml()
      } else {
        const s2f33DefineMsg = new SecsMessage(2, 33, true, L(U4(0), L()))
        files.s2f33DefineReport = s2f33DefineMsg.toSml()
      }
      logger.debug('✅ [EventBindService] Generated: 04_S2F33_DefineReport.txt')

      // 05_S2F35_EnableLinkEvent.txt
      if (ceidRptidBindingCeids.length > 0) {
        const ceidEnableItems = ceidRptidBindingCeids.map((ceid) => {
          const rptid = ceidRptidBinding[ceid]
          return L(U4(ceid), L(...rptid.map((rptid) => U4(rptid))))
        })
        const s2f35EnableMsg = new SecsMessage(2, 35, true, L(U4(0), L(...ceidEnableItems)))
        files.s2f35EnableLinkEvent = s2f35EnableMsg.toSml()
      } else {
        const s2f35EnableMsg = new SecsMessage(2, 35, true, L(U4(0), L()))
        files.s2f35EnableLinkEvent = s2f35EnableMsg.toSml()
      }
      logger.debug('✅ [EventBindService] Generated: 05_S2F35_EnableLinkEvent.txt')

      // 06_S2F37_EnableAllEvents.txt
      const s2f37EnableMsg = new SecsMessage(2, 37, true, L(BOOLEAN(true), L()))
      files.s2f37EnableAllEvents = s2f37EnableMsg.toSml()
      logger.debug('✅ [EventBindService] Generated: 06_S2F37_EnableAllEvents.txt')

      logger.info('✅ [EventBindService] All 6 EventBind files generated successfully')

      return {
        success: true,
        files
      }
    } catch (error) {
      logger.error('❌ [EventBindService] Failed to generate EventBind files:', error)
      throw new Error(`生成EventBind文件失败: ${error.message}`)
    }
  }
}

EventBindService.toString = () => '[class EventBindService]'

module.exports = {
  EventBindService,
  EventBindService: new EventBindService()
}
