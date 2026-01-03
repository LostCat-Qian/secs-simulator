/**
 * 基于函数字符串创建并执行函数
 * @param {string} funcString - 函数字符串
 * @param {Array} args - 要注入的参数数组
 * @returns {*} 函数执行结果
 */
function execFunction(funcString, args) {
  // 提取 handler 函数并执行
  // 脚本格式: async function handler(commingMsg, dir) { ... }
  const wrappedFunc = new Function('commingMsg', 'dir', `
    ${funcString}
    return handler(commingMsg, dir)
  `)
  return wrappedFunc(...args)
}

module.exports = {
  execFunction
}
