/**
 * Auto reply handler
 * use getMsgByFilePath(filePath) to get sml message object
 * @param {object} commingMsg args: stream, func, wBit, body(example: body[0][1].value)
 * @param {number} commingMsg.stream
 * @param {number} commingMsg.func
 * @param {boolean} commingMsg.wBit
 * @param {object} commingMsg.body
 * @param {string[]} filePaths args: sml files directory paths
 * @returns {string} sml file path
 */
async function handler(commingMsg, filePaths) {
  let targetPath = filePaths.find(f => f.includes('S1F2_Other'))
  const msg = await getMsgByFilePath(targetPath)
  const value = msg.body[0].value
  if (value === 'MDLN-A') {
    return targetPath
  }
}