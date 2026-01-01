/// <reference types="vite/client" />
/// <reference types="electron" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Electron API 类型声明
interface Window {
  require?: (module: string) => any
  electron?: {
    ipcRenderer: Electron.IpcRenderer
  }
}