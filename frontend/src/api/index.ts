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
}

const ipcApiRoute: IpcApiRoute = {
  test: 'controller/example/test',
  // file tree
  smlFileTree: 'controller/smlFile/getFileTree', // get sml directory tree
  smlFileContent: 'controller/smlFile/getFileContent', // get sml file content by file path
  smlFileSave: 'controller/smlFile/saveSmlFile', // save sml file content by file path
  smlFileCreate: 'controller/smlFile/createSmlFile', // create sml file by file path and name
  smlFileDelete: 'controller/smlFile/deleteSmlFile', // delete sml file by file path
  smlFolderCreate: 'controller/smlFile/createSmlFolder', // create sml folder by folder path and name
  smlFolderDelete: 'controller/smlFile/deleteSmlFolder', // delete sml folder by folder path
  // engine
  engineStart: 'controller/engine/start', // start engine
  engineStop: 'controller/engine/stop', // stop engine
  getEngineConfig: 'controller/engine/getConfig', // get engine json config
  deleteEngine: 'controller/engine/delete', // delete engine by name
  saveEngineConfig: 'controller/engine/saveConfig', // save engine json config
  // auto reply
  addScript: 'controller/autoReply/addScript', // add auto reply script
  getScript: 'controller/autoReply/getScript', // get auto reply script detail
  deleteScript: 'controller/autoReply/deleteScript', // delete auto reply script by name
  updateScript: 'controller/autoReply/updateScript', // update auto reply script
  isAutoReplyEnabled: 'controller/autoReply/isEnabled', // check if auto reply is enabled
  listScripts: 'controller/autoReply/listScripts' // list auto reply scripts
}

export { ipcApiRoute }
