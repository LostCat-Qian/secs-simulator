/**
 * Auto reply handler
 * @param {msg} args: stream, func, wBit, body ( body[0][1].value )
 * @param {string[]} args: sml files directory
 */
function handler(msg, dir) {
  if (msg.stream === 7 && msg.func === 25 && msg.body[0].value === 'chamber-A.rcp') {
    return dir.find((file) => file.includes('chamber-A.rcp'))
  }
}
