'use strict'

const { logger } = require('ee-core/log')
const { smlFileService } = require('../service/smlFile')

/**
 * smlFile
 * @class
 */
class SmlFileController {
  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test() {
    const result = await smlFileService.test('electron')
    logger.info('service result:', result)

    return 'hello electron-egg'
  }
}
SmlFileController.toString = () => '[class SmlFileController]'

module.exports = SmlFileController
