'use strict'

const { logger } = require('ee-core/log')
const { autoReplyService } = require('../service/autoReply')

class AutoReplyController {
  async test() {
    const result = await autoReplyService.test('electron')
    logger.info('service result:', result)

    return 'hello electron-egg'
  }

  async addScript(args, event) {
    try {
      logger.info('AutoReplyController addScript called:', args)
      const result = await autoReplyService.addScript(args)
      return result
    } catch (error) {
      logger.error('AutoReplyController addScript failed:', error)
      throw error
    }
  }

  async getScript(args, event) {
    try {
      logger.info('AutoReplyController getScript called:', args)
      const result = await autoReplyService.getScript(args)
      return result
    } catch (error) {
      logger.error('AutoReplyController getScript failed:', error)
      throw error
    }
  }

  async deleteScript(args, event) {
    try {
      logger.info('AutoReplyController deleteScript called:', args)
      const result = await autoReplyService.deleteScript(args)
      return result
    } catch (error) {
      logger.error('AutoReplyController deleteScript failed:', error)
      throw error
    }
  }

  async listScripts(args, event) {
    try {
      logger.info('AutoReplyController listScripts called')
      const result = await autoReplyService.listScripts()
      return result
    } catch (error) {
      logger.error('AutoReplyController listScripts failed:', error)
      throw error
    }
  }

  async updateScript(args, event) {
    try {
      logger.info('AutoReplyController updateScript called:', args)
      const result = await autoReplyService.updateScript(args)
      return result
    } catch (error) {
      logger.error('AutoReplyController updateScript failed:', error)
      throw error
    }
  }

  async isEnabled(args, event) {
    try {
      logger.info('AutoReplyController isEnabled called')
      const result = await autoReplyService.isEnabled()
      return result
    } catch (error) {
      logger.error('AutoReplyController isEnabled failed:', error)
      throw error
    }
  }
}
AutoReplyController.toString = () => '[class AutoReplyController]'

module.exports = AutoReplyController
