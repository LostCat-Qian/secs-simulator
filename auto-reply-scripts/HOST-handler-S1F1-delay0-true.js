/**
  * Auto reply handler
  * @param {commingMsg} args: stream, func, wBit, body ( body[0][1].value )
  * @param {string[]} args: sml files directory
  */
function handler(commingMsg, dir) {
  // if (msg.stream === 7 && msg.func === 25 && msg.body[0].value === 'chamber-A.rcp') {
  //   return dir.find((file) => file.includes('chamber-A.rcp'))
  // }

  const msg = getMsgByFilePath('Communication/S1F1.txt')
  console.log(msg.stream, msg.func, msg.toSml())
  return 'Communication/S1F1.txt'
}