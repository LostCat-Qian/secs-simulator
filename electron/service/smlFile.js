'use strict'

const { logger } = require('ee-core/log')

/**
 * 示例服务
 * @class
 */
class SmlFileService {
  /**
   * test
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
