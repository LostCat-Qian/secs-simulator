/**
 * 主进程与渲染进程通信频道定义
 * Definition of communication channels between main process and rendering process
 */
interface IpcApiRoute {
  test: string
  // file tree
  smlFileTree: string
  smlFileContent: string
  smlFileSave: string
  smlFileCreate: string
  smlFileDelete: string
  smlFolderCreate: string
  smlFolderDelete: string
  // engine
  engineStart: string
  engineStop: string
  sendMessageFromFile: string
  getEngineConfig: string
  deleteEngine: string
  saveEngineConfig: string
  // auto reply
  addScript: string
  getScript: string
  deleteScript: string
  updateScript: string
  isAutoReplyEnabled: string
  listScripts: string
  listSerialPorts: string
  // define link
  createEventBindFolder: string
  saveEventBindFiles: string
  generateEventBindFiles: string
}

const ipcApiRoute: IpcApiRoute = {
  test: 'controller/example/test',
  // file tree
  smlFileTree: 'controller/smlFile/getFileTree',
  smlFileContent: 'controller/smlFile/getFileContent',
  smlFileSave: 'controller/smlFile/saveSmlFile',
  smlFileCreate: 'controller/smlFile/createSmlFile',
  smlFileDelete: 'controller/smlFile/deleteSmlFile',
  smlFolderCreate: 'controller/smlFile/createSmlFolder',
  smlFolderDelete: 'controller/smlFile/deleteSmlFolder',
  // engine
  engineStart: 'controller/engine/start',
  engineStop: 'controller/engine/stop',
  sendMessageFromFile: 'controller/engine/sendMessageFromFile',
  getEngineConfig: 'controller/engine/getConfig',
  deleteEngine: 'controller/engine/delete',
  saveEngineConfig: 'controller/engine/saveConfig',
  // auto reply
  addScript: 'controller/autoReply/addScript',
  getScript: 'controller/autoReply/getScript',
  deleteScript: 'controller/autoReply/deleteScript',
  updateScript: 'controller/autoReply/updateScript',
  isAutoReplyEnabled: 'controller/autoReply/isEnabled',
  listScripts: 'controller/autoReply/listScripts',
  listSerialPorts: 'controller/engine/listSerialPorts',
  // event bind
  createEventBindFolder: 'controller/eventBind/createFolder',
  saveEventBindFiles: 'controller/eventBind/saveFiles',
  generateEventBindFiles: 'controller/eventBind/generateEventBindFiles'
}

export { ipcApiRoute }
