/**
 * 基于函数字符串创建并执行函数
 * @param {string} funcString - 函数字符串
 * @param {Array} args - 要注入的参数数组
 * @returns {*} 函数执行结果
 */
function execFunction(funcString, args) {
  const func = new Function('return ' + funcString)()
  return func(...args)
}

module.exports = {
  execFunction
}
