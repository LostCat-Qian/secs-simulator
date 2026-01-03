/**
 * Auto reply handler
 * use getMsgByFilePath(filePath) to get sml message object
 * @param {msg} args: stream, func, wBit, body(example: body[0][1].value)
 * @param {string[]} args: sml files directory paths
 * @returns {string} sml file path
 */
async function handler(commingMsg, filePaths) {
  const msg = await getMsgByFilePath('Communication/S1F1.txt')
  console.log(msg.stream, msg.func, msg.toSml())
  return 'Communication/S1F1.txt'
}
