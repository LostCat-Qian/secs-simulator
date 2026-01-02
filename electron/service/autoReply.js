'use strict'

const { logger } = require('ee-core/log')

/**
 * 自动回复服务
 * @class
 */
class AutoReplyService {
  /**
   * test
   */
  async test(args) {
    let obj = {
      status: 'ok',
      params: args
    }

    logger.info('AutoReplyService obj:', obj)

    return obj
  }
}
AutoReplyService.toString = () => '[class AutoReplyService]'

module.exports = {
  AutoReplyService,
  autoReplyService: new AutoReplyService()
}
