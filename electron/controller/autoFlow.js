'use strict'

const { logger } = require('ee-core/log')
const { autoFlowService } = require('../service/autoflow')

class AutoFlowController {
  async listFlows(args, event) {
    try {
      logger.info('AutoFlowController listFlows called')
      return await autoFlowService.listFlows()
    } catch (error) {
      logger.error('AutoFlowController listFlows failed:', error)
      throw error
    }
  }

  async getFlow(args, event) {
    try {
      logger.info('AutoFlowController getFlow called:', args)
      return await autoFlowService.getFlow(args)
    } catch (error) {
      logger.error('AutoFlowController getFlow failed:', error)
      throw error
    }
  }

  async saveFlow(args, event) {
    try {
      logger.info('AutoFlowController saveFlow called')
      return await autoFlowService.saveFlow(args)
    } catch (error) {
      logger.error('AutoFlowController saveFlow failed:', error)
      throw error
    }
  }

  async deleteFlow(args, event) {
    try {
      logger.info('AutoFlowController deleteFlow called:', args)
      return await autoFlowService.deleteFlow(args)
    } catch (error) {
      logger.error('AutoFlowController deleteFlow failed:', error)
      throw error
    }
  }

  async run(args, event) {
    try {
      logger.info('AutoFlowController run called:', args)
      if (!event || !event.sender) {
        throw new Error('缺少事件上下文，无法推送运行状态')
      }
      const sendEvent = (type, payload) => {
        event.sender.send('autoflow/event', { type, ...payload })
      }
      return await autoFlowService.runFlow(args, { sendEvent })
    } catch (error) {
      logger.error('AutoFlowController run failed:', error)
      throw error
    }
  }

  async pause(args, event) {
    try {
      logger.info('AutoFlowController pause called:', args)
      return autoFlowService.pauseRun(args)
    } catch (error) {
      logger.error('AutoFlowController pause failed:', error)
      throw error
    }
  }

  async resume(args, event) {
    try {
      logger.info('AutoFlowController resume called:', args)
      return autoFlowService.resumeRun(args)
    } catch (error) {
      logger.error('AutoFlowController resume failed:', error)
      throw error
    }
  }

  async stop(args, event) {
    try {
      logger.info('AutoFlowController stop called:', args)
      return autoFlowService.stopRun(args)
    } catch (error) {
      logger.error('AutoFlowController stop failed:', error)
      throw error
    }
  }
}

AutoFlowController.toString = () => '[class AutoFlowController]'

module.exports = AutoFlowController
