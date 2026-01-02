'use strict'

const { logger } = require('ee-core/log')

/**
 * 引擎服务
 * @class
 */
class EngineService {
  /**
   * test
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
