import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import type { LogPanelData, EngineData } from '../types'

/**
 * Hook for managing log panels
 * @returns Log panel state and methods
 */
export function useLogPanels() {
  // State
  const logPanels = ref<LogPanelData[]>([])

  let panelCounter = 1

  /**
   * Redistributes the width of all log panels evenly.
   */
  const redistributePanelWidths = () => {
    const count = logPanels.value.length
    if (count === 1) {
      logPanels.value[0].width = '100%'
    } else {
      const percentage = 100 / count
      logPanels.value.forEach((panel) => {
        panel.width = `${percentage}%`
      })
    }
  }

  /**
   * Adds a new log panel for a specific engine.
   * Ensures that each engine has at most one dedicated log panel.
   * @param engine The engine to add a log panel for
   * @param engineIndex The index of the engine in the list
   */
  const addLogPanel = (engine: EngineData, engineIndex: number) => {
    const existingPanel = logPanels.value.find((panel) => panel.engineName === engine.name)
    if (existingPanel) {
      // Panel already exists, no need to show warning every time if triggered automatically
      // But if triggered manually, maybe we want to focus it?
      // For now, just return
      return
    }

    panelCounter++
    const newPanel: LogPanelData = {
      id: String(panelCounter),
      title: `${engine.name} Logs`,
      engineId: String(engineIndex),
      engineName: engine.name,
      width: '0%',
      logs: []
    }
    logPanels.value.push(newPanel)
    redistributePanelWidths()
    // Message.success(`Log Panel ${panelCounter} added for ${engine.name}`);
  }

  /**
   * Removes a log panel by ID.
   * @param panelId The ID of the panel to remove
   */
  const removePanel = (panelId: string) => {
    const index = logPanels.value.findIndex((p) => p.id === panelId)
    if (index > -1) {
      logPanels.value.splice(index, 1)
      redistributePanelWidths()
      Message.success('Log panel closed')
    }
  }

  /**
   * Clears logs for a specific panel.
   * @param panelId The ID of the panel to clear
   */
  const clearLogs = (panelId: string) => {
    const panel = logPanels.value.find((p) => p.id === panelId)
    if (panel) {
      panel.logs = []
      Message.success('Logs cleared')
    }
  }

  /**
   * Adds a log entry to the appropriate panel(s).
   * @param engineName Name of the engine
   * @param level Log level
   * @param message Log message
   */
  const addLogEntry = (engineName: string, level: string, message: string) => {
    const time = new Date().toLocaleTimeString()

    // Add to specific engine panels
    logPanels.value.forEach((panel) => {
      if (panel.engineName === engineName) {
        panel.logs.push({
          time,
          level,
          message
        })
        // Performance optimization: limit log entries
        if (panel.logs.length > 1000) {
          panel.logs.shift()
        }
      }
    })

    // Optionally add to "All Engines" panel if we had one that collects everything?
    // Current logic seems to be specific panels only match specific engines.
    // The default panel has engineName 'All Engines', but maybe we want to push everything there too?
    // The original code:
    // const targetPanels = logPanels.value.filter(panel => panel.engineName === payload.name);
    // ...
    // logPanels.value.forEach(panel => { if (panel.engineName === payload.name) ... })
    // So it seems strictly filtered.
  }

  return {
    logPanels,
    addLogPanel,
    removePanel,
    clearLogs,
    addLogEntry
  }
}
