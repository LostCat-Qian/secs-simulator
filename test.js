globalThis['pfunc'] = () => {
  console.log(11111)
}

function execFunction(funcString, args) {
  const func = new Function('return ' + funcString)()
  return func(...args)
}

const f = execFunction('function test(a, b) { pfunc(); return a + b }', [1, 2])
console.log(f)
