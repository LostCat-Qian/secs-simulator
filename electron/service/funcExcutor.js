/**
 * 基于函数字符串创建并执行函数
 * @param {string} funcString - 函数字符串
 * @param {Array} args - 要注入的参数数组
 * @returns {*} 函数执行结果
 */
async function execFunction(funcString, args) {
  // 提取 handler 函数并执行
  // 脚本格式: async function handler(commingMsg, filePaths) { ... }
  const wrappedFunc = new Function(
    'commingMsg',
    'filePaths',
    `
    ${funcString}
    return handler(commingMsg, filePaths)
    `
  )
  const result = wrappedFunc(...args)
  return await result
}

module.exports = {
  execFunction
}
