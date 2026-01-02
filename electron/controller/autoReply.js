'use strict'

const { logger } = require('ee-core/log')
const { autoReplyService } = require('../service/autoReply')

/**
 * autoReply
 * @class
 */
class AutoReplyController {
  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test() {
    const result = await autoReplyService.test('electron')
    logger.info('service result:', result)

    return 'hello electron-egg'
  }
}
AutoReplyController.toString = () => '[class AutoReplyController]'

module.exports = AutoReplyController
