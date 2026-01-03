import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/api'
import type { AutoReplyItem, AutoReplyFormData } from '../types'

/**
 * Hook for managing auto-reply scripts
 * @returns Auto reply state and methods
 */
export function useAutoReply() {
  const tableData = ref<AutoReplyItem[]>([])
  const defaultAutoReplyScript = `/**
  * Auto reply handler
  * @param {msg} args: stream, func, wBit, body ( body[0][1].value )
  * @param {string[]} args: sml files directory
  */
function handler(msg, dir) {
  if (msg.stream === 7 && msg.func === 25 && msg.body[0].value === 'chamber-A.rcp') {
    return dir.find((file) => file.includes('chamber-A.rcp'))
  }
}`

  /**
   * Loads auto-reply scripts from backend.
   */
  const loadAutoReplyScripts = async () => {
    if (!ipc) return
    try {
      const result = await ipc.invoke(ipcApiRoute.listScripts, null)
      if (Array.isArray(result)) {
        tableData.value = result.map((item: any) => ({
          name: String(item.name || ''),
          tool: String(item.tool || ''),
          sf: String(item.sf || ''),
          delaySeconds: Number.isFinite(Number(item.delaySeconds)) ? Number(item.delaySeconds) : 0,
          active: Boolean(item.active)
        }))
      } else {
        tableData.value = []
      }
    } catch (error) {
      console.error('Failed to load auto reply scripts:', error)
      Message.error('Failed to load auto reply scripts')
    }
  }

  /**
   * Gets details of a specific script.
   * @param name Script name
   */
  const getScriptDetail = async (name: string) => {
    if (!ipc) throw new Error('IPC not available')
    return await ipc.invoke(ipcApiRoute.getScript, { name })
  }

  /**
   * Saves (adds or updates) an auto-reply script.
   * @param form The form data
   * @param editingName The original name if editing (null if adding)
   */
  const saveAutoReplyScript = async (form: AutoReplyFormData, editingName: string | null) => {
    if (!form.tool) {
      Message.error('Tool is required')
      return false
    }
    if (!form.handlerSf) {
      Message.error('Handle SF is required')
      return false
    }
    if (!form.script.trim()) {
      Message.error('Script is required')
      return false
    }

    if (!ipc) {
      Message.error('Cannot save auto reply')
      return false
    }

    try {
      if (editingName) {
        await ipc.invoke(ipcApiRoute.updateScript, {
          originalName: editingName,
          tool: form.tool,
          handlerSf: form.handlerSf,
          active: form.active,
          delaySeconds: form.delaySeconds,
          code: form.script
        })
        Message.success('Auto reply script updated')
      } else {
        await ipc.invoke(ipcApiRoute.addScript, {
          tool: form.tool,
          handlerSf: form.handlerSf,
          active: form.active,
          delaySeconds: form.delaySeconds,
          code: form.script
        })
        Message.success('Auto reply script added')
      }

      await loadAutoReplyScripts()
      return true
    } catch (error) {
      console.error('Failed to save auto reply script:', error)
      Message.error('Failed to save auto reply script')
      return false
    }
  }

  /**
   * Deletes an auto-reply script.
   * @param item The script item to delete
   */
  const deleteAutoReplyScript = async (item: AutoReplyItem) => {
    return new Promise<void>((resolve, reject) => {
      Modal.confirm({
        title: 'Delete Auto Reply Script',
        content: `Are you sure you want to delete script for ${item.tool} / ${item.sf}?`,
        okText: 'Delete',
        cancelText: 'Cancel',
        async onOk() {
          if (!ipc) {
            Message.error('Cannot delete auto reply')
            reject()
            return
          }
          try {
            await ipc.invoke(ipcApiRoute.deleteScript, { name: item.name })
            await loadAutoReplyScripts()
            Message.success('Auto reply script deleted')
            resolve()
          } catch (error) {
            console.error('Failed to delete auto reply script:', error)
            Message.error('Failed to delete auto reply script')
            reject(error)
          }
        }
      })
    })
  }

  return {
    tableData,
    defaultAutoReplyScript,
    loadAutoReplyScripts,
    getScriptDetail,
    saveAutoReplyScript,
    deleteAutoReplyScript
  }
}
