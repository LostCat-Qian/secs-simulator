/**
 * Auto reply handler
 * @param {msg} args: stream, func, wBit, body ( body[0][1].value )
 * @param {string[]} args: sml files directory
 */
function handler(msg, dir) {
  if (msg.func % 2 !== 0) {
    return dir.find((file) => file.includes(`S${msg.stream}F${msg.func + 1}`))[0]
  }
}
