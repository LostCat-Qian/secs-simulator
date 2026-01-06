'use strict'

const path = require('path')
const { app } = require('electron')
const { getBaseDir } = require('ee-core/ps')

/**
 * 获取外部资源目录路径（兼容开发和生产环境）
 * 针对 electron-builder 的 extraFiles 配置
 * @param {string} dirName - 目录名称
 * @returns {string} - 绝对路径
 */
function getExtraResourceDir(dirName) {
  // 检查是否是打包环境
  const isPackaged = app.isPackaged

  if (isPackaged) {
    // 生产环境：extraFiles 位于可执行文件同级目录
    // Windows: app.exe 所在目录
    // Mac: Contents/MacOS 目录
    return path.join(path.dirname(process.execPath), dirName)
  } else {
    // 开发环境：位于项目根目录
    return path.join(getBaseDir(), dirName)
  }
}

module.exports = {
  getExtraResourceDir
}
