import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/api'
import type { AutoFlowConfig, AutoFlowRunEvent, AutoFlowSummary } from '../types'

/**
 * AutoFlow 状态与方法集合
 *
 * 设计说明：
 * - 配置存储在主进程 autoflows/ 目录，前端通过 IPC 管理
 * - 运行状态通过主进程 push 的 autoflow/event 通道实时更新
 */
export function useAutoFlow() {
  const flowList = ref<AutoFlowSummary[]>([])
  const currentFlow = ref<AutoFlowConfig | null>(null)
  const currentFlowName = ref<string | null>(null)

  const runId = ref<string | null>(null)
  const runState = ref<'idle' | 'running' | 'paused' | 'completed' | 'stopped' | 'error'>('idle')
  const progress = ref<{ currentStepIndex: number; totalSteps: number } | null>(null)
  const runLogs = ref<Array<{ level: string; message: string; ts: number }>>([])

  const loadFlows = async () => {
    if (!ipc) return
    try {
      const result = await ipc.invoke(ipcApiRoute.listAutoFlows, null)
      flowList.value = Array.isArray(result) ? (result as AutoFlowSummary[]) : []
    } catch (error) {
      console.error('Failed to load autoflows:', error)
      Message.error('Failed to load AutoFlow list')
      flowList.value = []
    }
  }

  const loadFlow = async (name: string) => {
    if (!ipc) return
    try {
      const flow = (await ipc.invoke(ipcApiRoute.getAutoFlow, { name })) as AutoFlowConfig
      currentFlow.value = flow
      currentFlowName.value = flow?.name || name
    } catch (error) {
      console.error('Failed to load autoflow:', error)
      Message.error('Failed to load AutoFlow')
    }
  }

  const saveFlow = async (flow: AutoFlowConfig) => {
    if (!ipc) return false
    try {
      /**
       * 通过 IPC 发送的参数必须满足 Structured Clone 约束。
       * Vue 的响应式对象/Proxy 不能被直接克隆，需要先转为纯 JSON 数据。
       */
      const safeFlow = JSON.parse(JSON.stringify(flow)) as AutoFlowConfig
      await ipc.invoke(ipcApiRoute.saveAutoFlow, { flow: safeFlow })
      Message.success('AutoFlow saved')
      await loadFlows()
      currentFlow.value = flow
      currentFlowName.value = flow.name
      return true
    } catch (error: any) {
      console.error('Failed to save autoflow:', error)
      const msg = error?.message || 'Failed to save AutoFlow'
      Message.error(msg)
      return false
    }
  }

  const deleteFlow = async (name: string) => {
    if (!ipc) return false
    const ok = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: 'Delete AutoFlow',
        content: `Delete "${name}"?`,
        okText: 'Delete',
        cancelText: 'Cancel',
        onOk: () => resolve(true),
        onCancel: () => resolve(false)
      })
    })
    if (!ok) return false

    try {
      await ipc.invoke(ipcApiRoute.deleteAutoFlow, { name })
      Message.success('AutoFlow deleted')
      if (currentFlowName.value === name) {
        currentFlow.value = null
        currentFlowName.value = null
      }
      await loadFlows()
      return true
    } catch (error) {
      console.error('Failed to delete autoflow:', error)
      Message.error('Failed to delete AutoFlow')
      return false
    }
  }

  const resetRunView = () => {
    runId.value = null
    runState.value = 'idle'
    progress.value = null
    runLogs.value = []
  }

  const runFlow = async (name: string) => {
    if (!ipc) return
    try {
      resetRunView()
      const result = await ipc.invoke(ipcApiRoute.runAutoFlow, { name })
      runId.value = String((result as any)?.runId || '')
      runState.value = 'running'
    } catch (error: any) {
      console.error('Failed to run autoflow:', error)
      const msg = error?.message || 'Failed to run AutoFlow'
      Message.error(msg)
    }
  }

  const pauseRun = async () => {
    if (!ipc || !runId.value) return
    await ipc.invoke(ipcApiRoute.pauseAutoFlow, { runId: runId.value })
  }

  const resumeRun = async () => {
    if (!ipc || !runId.value) return
    await ipc.invoke(ipcApiRoute.resumeAutoFlow, { runId: runId.value })
  }

  const stopRun = async () => {
    if (!ipc || !runId.value) return
    await ipc.invoke(ipcApiRoute.stopAutoFlow, { runId: runId.value })
  }

  const isRunState = (state: string): state is 'idle' | 'running' | 'paused' | 'completed' | 'stopped' | 'error' => {
    return (
      state === 'idle' ||
      state === 'running' ||
      state === 'paused' ||
      state === 'completed' ||
      state === 'stopped' ||
      state === 'error'
    )
  }

  const handleRunEvent = (evt: AutoFlowRunEvent) => {
    if (!evt || !evt.runId) return
    if (runId.value && evt.runId !== runId.value) return

    if (evt.type === 'state' && typeof evt.state === 'string') {
      if (isRunState(evt.state)) {
        runState.value = evt.state
      }
    }
    if (evt.type === 'progress' && typeof evt.currentStepIndex === 'number' && typeof evt.totalSteps === 'number') {
      progress.value = { currentStepIndex: evt.currentStepIndex, totalSteps: evt.totalSteps }
    }
    if (evt.type === 'log') {
      runLogs.value = [
        ...runLogs.value,
        {
          level: String(evt.level || 'INFO'),
          message: String(evt.message || ''),
          ts: Number(evt.ts || Date.now())
        }
      ]
    }
  }

  return {
    flowList,
    currentFlow,
    currentFlowName,
    runId,
    runState,
    progress,
    runLogs,
    loadFlows,
    loadFlow,
    saveFlow,
    deleteFlow,
    runFlow,
    pauseRun,
    resumeRun,
    stopRun,
    resetRunView,
    handleRunEvent
  }
}
