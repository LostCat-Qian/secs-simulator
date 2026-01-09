import { ref } from 'vue'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/api'
import { Message } from '@arco-design/web-vue'

export interface EventBindFile {
  name: string
  content: string
}

export interface SaveResult {
  success: boolean
  message: string
  folderPath?: string
  files?: string[]
}

export interface EventBindFiles {
  s2f37DisableAllEvents: string
  s2f35DisableLink: string
  s2f33DisableReport: string
  s2f33DefineReport: string
  s2f35EnableLinkEvent: string
  s2f37EnableAllEvents: string
}

export function useEventBind() {
  const saving = ref(false)
  const generating = ref(false)

  async function generateEventBindFiles(tomlContent: string): Promise<{ success: boolean; files?: EventBindFiles }> {
    if (!ipc) {
      throw new Error('IPC not available')
    }

    generating.value = true
    try {
      const result: any = await ipc.invoke(ipcApiRoute.generateEventBindFiles, {
        tomlContent
      })

      if (result && result.success) {
        return {
          success: true,
          files: result.files
        }
      } else {
        throw new Error(result?.message || 'Generation failed')
      }
    } finally {
      generating.value = false
    }
  }

  async function saveEventBindFiles(folderPath: string, files: EventBindFile[]): Promise<SaveResult> {
    if (!ipc) {
      throw new Error('IPC not available')
    }

    saving.value = true
    try {
      const result: any = await ipc.invoke(ipcApiRoute.saveEventBindFiles, {
        folderPath,
        files
      })

      if (result && result.success) {
        return {
          success: true,
          message: result.message,
          folderPath: result.folderPath,
          files: result.files
        }
      } else {
        throw new Error(result?.message || 'Save failed')
      }
    } finally {
      saving.value = false
    }
  }

  async function handleSaveEventBind(eventBindPayload: { folderPath: string; files: EventBindFile[] }) {
    try {
      const result = await saveEventBindFiles(eventBindPayload.folderPath, eventBindPayload.files)
      Message.success(
        `EventBind saved successfully!\nSaved to: sml/EventBind/${
          eventBindPayload.folderPath
        }/\nFiles: ${result.files?.join(', ')}`
      )
      return result
    } catch (error: any) {
      console.error('Failed to save EventBind:', error)
      const msg = error?.message || 'Failed to save EventBind files'
      Message.error(msg)
      throw error
    }
  }

  return {
    saving,
    generating,
    generateEventBindFiles,
    saveEventBindFiles,
    handleSaveEventBind
  }
}
