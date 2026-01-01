/**
 * 主进程与渲染进程通信频道定义
 * Definition of communication channels between main process and rendering process
 */
interface IpcApiRoute {
  test: string
}

const ipcApiRoute: IpcApiRoute = {
  test: 'controller/example/test'
}

export { ipcApiRoute }