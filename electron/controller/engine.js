'use strict'

const { logger } = require('ee-core/log')
const { engineService } = require('../service/engine')

/**
 * engine
 * @class
 */
class EngineController {
  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test() {
    const result = await engineService.test('electron')
    logger.info('service result:', result)

    return 'hello electron-egg'
  }
}
EngineController.toString = () => '[class EngineController]'

module.exports = EngineController
