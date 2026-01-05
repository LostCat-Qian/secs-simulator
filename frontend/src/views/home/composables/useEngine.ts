import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/api'
import type { EngineData } from '../types'

/**
 * Hook for managing engine configurations and status
 * @returns Engine management state and methods
 */
export function useEngine() {
  const engineList = ref<EngineData[]>([])

  /**
   * Loads engine configurations from the backend.
   */
  const loadEngineConfigs = async () => {
    if (!ipc) return
    try {
      const result = await ipc.invoke(ipcApiRoute.getEngineConfig, null)
      if (Array.isArray(result)) {
        engineList.value = result.map((item: any) => {
          const fileName = String(item.fileName || '')
          const config = item.config || {}
          const name = String(config.name || fileName.replace(/\.json$/i, ''))
          return {
            name,
            active: false,
            status: 'idle',
            fileName,
            config
          } as EngineData
        })
      } else {
        engineList.value = []
      }
    } catch (error) {
      console.error('Failed to load engine configs:', error)
      Message.error('Failed to load engine configs')
    }
  }

  /**
   * Helper to convert form data to engine config object
   * @param formData The raw form data
   */
  const buildEngineConfigFromForm = (formData: any) => {
    const toNumber = (value: unknown) => {
      const n = Number(value)
      return Number.isFinite(n) ? n : undefined
    }

    const config: Record<string, any> = {}
    config.type = formData.type
    config.name = formData.name
    config.deviceId = toNumber(formData.deviceId)
    config.path = formData.serialPort
    const baudRate = toNumber(formData.baud)
    if (baudRate !== undefined) {
      config.baudRate = baudRate
    }
    config.master = String(formData.master || '') === 'Master'
    config.ip = formData.remoteIp || formData.localIp
    const port = toNumber(formData.tcpPort)
    if (port !== undefined) {
      config.port = port
    }
    config.simulate = formData.simulate
    const timeoutKeys = ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'] as const
    timeoutKeys.forEach((key, index) => {
      const v = toNumber(formData[key])
      if (v !== undefined) {
        config[`timeoutT${index + 1}`] = v
      }
    })
    const dataBit = toNumber(formData.dataBit)
    if (dataBit !== undefined) {
      config.dataBit = dataBit
    }
    const stopBit = toNumber(formData.stopBit)
    if (stopBit !== undefined) {
      config.stopBit = stopBit
    }
    if (formData.parity === 'None') {
      config.parity = null
    } else {
      config.parity = formData.parity
    }
    return config
  }

  /**
   * Saves a new or updated engine configuration.
   * @param formData The form data
   * @param editingEngine The engine being edited (if any) to handle rename/delete old file
   */
  const saveEngineConfig = async (formData: any, editingEngine: EngineData | null) => {
    if (!ipc) {
      Message.error('Cannot save engine config')
      return false
    }

    const config = buildEngineConfigFromForm(formData)

    try {
      await ipc.invoke(ipcApiRoute.saveEngineConfig, { config })

      if (editingEngine && editingEngine.fileName) {
        const originalName = editingEngine.name
        if (originalName && originalName !== config.name) {
          try {
            await ipc.invoke(ipcApiRoute.deleteEngine, {
              fileName: editingEngine.fileName
            })
          } catch (e) {
            // Ignore delete error if file doesn't exist or whatever
          }
        }
      }

      await loadEngineConfigs()
      Message.success(`Engine "${config.name}" saved`)
      return true
    } catch (error) {
      console.error('Failed to save engine config:', error)
      Message.error('Failed to save engine config')
      return false
    }
  }

  /**
   * Deletes an engine configuration.
   * @param engine The engine to delete
   */
  const deleteEngine = async (engine: EngineData) => {
    return new Promise<void>((resolve, reject) => {
      Modal.confirm({
        title: 'Delete Engine',
        content: `Are you sure you want to delete ${engine.name}?`,
        okText: 'Delete',
        cancelText: 'Cancel',
        onOk: async () => {
          if (!ipc) {
            Message.error('Cannot delete engine')
            reject()
            return
          }
          try {
            const fileName = engine.fileName || `${engine.name}.json`
            await ipc.invoke(ipcApiRoute.deleteEngine, { fileName })
            await loadEngineConfigs()
            Message.success('Engine deleted')
            resolve()
          } catch (error) {
            console.error('Failed to delete engine:', error)
            Message.error('Failed to delete engine')
            reject(error)
          }
        },
        onCancel: () => {
          resolve() // Resolved but nothing happened
        }
      })
    })
  }

  /**
   * Starts an engine.
   * @param engine The engine to start
   */
  const startEngine = async (engine: EngineData) => {
    if (!ipc) {
      Message.error('Cannot start engine')
      return
    }

    // Update status to connecting
    engineList.value = engineList.value.map((item) => ({
      ...item,
      status: item.fileName === engine.fileName ? 'connecting' : item.status
    }))

    try {
      await ipc.invoke(ipcApiRoute.engineStart, {
        config: JSON.parse(JSON.stringify(engine.config || {}))
      })

      // Update status to running
      engineList.value = engineList.value.map((item) => ({
        ...item,
        active: item.fileName === engine.fileName ? true : item.active,
        status: item.fileName === engine.fileName ? 'running' : item.status
      }))
      Message.success(`Engine "${engine.name}" started`)
    } catch (error) {
      // Revert status to idle on failure
      engineList.value = engineList.value.map((item) => ({
        ...item,
        status: item.fileName === engine.fileName ? 'idle' : item.status
      }))
      console.error('Failed to start engine:', error)
      Message.error('Failed to start engine')
    }
  }

  /**
   * Stops an engine.
   * @param engineName The name of the engine to stop
   * @param fileName The file name of the engine (optional, used for state update matching)
   */
  const stopEngine = async (engineName: string, _?: string) => {
    if (!ipc) {
      Message.error('Cannot stop engine')
      return
    }

    try {
      await ipc.invoke(ipcApiRoute.engineStop, { name: engineName })

      engineList.value = engineList.value.map((item) => ({
        ...item,
        active: item.name === engineName ? false : item.active,
        status: item.name === engineName ? 'idle' : item.status
      }))
      Message.success(`Engine "${engineName}" stopped`)
    } catch (error) {
      console.error('Failed to stop engine:', error)
      Message.error('Failed to stop engine')
      throw error
    }
  }

  /**
   * Updates engine status based on IPC events.
   * @param name Engine name
   * @param type Event type ('connected', 'selected', 'disconnected', 'stopped')
   */
  const updateEngineStatus = (name: string, type: string) => {
    if (type === 'connected') {
      engineList.value = engineList.value.map((item) => ({
        ...item,
        status: item.name === name ? 'connecting' : item.status
      }))
    } else if (type === 'selected') {
      engineList.value = engineList.value.map((item) => ({
        ...item,
        active: item.name === name ? true : item.active,
        status: item.name === name ? 'running' : item.status
      }))
    } else if (type === 'disconnected') {
      engineList.value = engineList.value.map((item) => ({
        ...item,
        status: item.name === name ? 'connecting' : item.status
      }))
    } else if (type === 'stopped') {
      engineList.value = engineList.value.map((item) => ({
        ...item,
        active: item.name === name ? false : item.active,
        status: item.name === name ? 'idle' : item.status
      }))
    }
  }

  return {
    engineList,
    loadEngineConfigs,
    saveEngineConfig,
    deleteEngine,
    startEngine,
    stopEngine,
    updateEngineStatus
  }
}
