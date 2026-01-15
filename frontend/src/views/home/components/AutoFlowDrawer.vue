<template>
  <a-drawer :visible="visible" title="AutoFlow" :mask-closable="true" width="100%" :footer="false" unmount-on-close
    render-to-body @cancel="handleClose">
    <div class="autoflow-layout">
      <!-- Left Panel: Flow List -->
      <div class="left-panel">
        <div class="panel-header">
          <span class="title">AutoFlow List</span>
          <a-button size="mini" type="primary" @click="handleNewFlow">New</a-button>
        </div>
        <div class="flow-list-container">
          <a-list :bordered="false" size="small" :split="false">
            <a-list-item v-for="item in flowList" :key="item.fileName"
              :class="['flow-item', { active: item.name === selectedFlowName }]" @click="selectFlow(item.name)">
              <div class="flow-item-main">
                <div class="flow-name">
                  {{ item.name }}
                  <a-tag v-if="item.invalid" size="small" color="red">invalid</a-tag>
                </div>
                <div class="flow-sub">{{ (item.tools?.length ? item.tools.join(', ') : item.tool) || '-' }} · {{
                  item.stepCount
                }} steps</div>
              </div>
            </a-list-item>
          </a-list>
        </div>
      </div>

      <!-- Right Panel: Workspace -->
      <div class="right-panel">
        <!-- Toolbar -->
        <div class="top-toolbar">
          <a-space>
            <a-select v-model="localTools" multiple class="tool-select" placeholder="Select Engines"
              :disabled="runState === 'running'">
              <a-option v-for="e in allEngines" :key="e.fileName || e.name" :value="e.name"
                :disabled="String(e.config?.simulate || '') !== 'Equipment'">
                {{ e.name }}
                <span v-if="String(e.config?.simulate || '') !== 'Equipment'">(Host)</span>
              </a-option>
            </a-select>
            <a-input v-model="localName" class="name-input" placeholder="Flow Name"
              :disabled="runState === 'running'" />
          </a-space>

          <a-space>
            <a-button size="small" type="secondary" @click="handleRefresh">Refresh</a-button>
            <a-button size="small" type="primary" @click="handleSave" :disabled="!canEdit">Save</a-button>
            <a-button size="small" status="danger" type="dashed" @click="handleDelete"
              :disabled="!canEdit || !selectedFlowName">
              Delete
            </a-button>

            <a-divider direction="vertical" />

            <a-button size="small" type="primary" :disabled="!canRun" @click="handleRun">Run</a-button>
            <a-button size="small" type="secondary" :disabled="!canPause" @click="pauseRun">Pause</a-button>
            <a-button size="small" type="secondary" :disabled="!canResume" @click="resumeRun">Resume</a-button>
            <a-button size="small" status="danger" type="dashed" :disabled="!canStop" @click="stopRun">Stop</a-button>
          </a-space>
        </div>

        <!-- Main Work Area -->
        <div class="work-area">
          <a-tabs default-active-key="config" size="small" type="card-gutter">
            <a-tab-pane key="config" title="Flow Config">
              <div class="config-container">
                <!-- Steps Section -->
                <div class="steps-section">
                  <div class="section-header">
                    <span class="title">Visual Flow Orchestration</span>
                  </div>

                  <div class="graph-wrapper">
                    <FlowGraphEditor
                      v-model:steps="localSteps"
                      :sml-files="smlFiles"
                      :available-tools="localTools"
                    />
                  </div>
                </div>

                <!-- JSON Section -->
                <div class="json-section">
                  <div class="section-header">
                    <span class="title">JSON Config</span>
                    <a-space>
                      <a-button size="mini" @click="syncJsonFromLocal">Refresh JSON</a-button>
                      <a-button size="mini" type="primary" @click="applyJsonToLocal">Apply JSON</a-button>
                    </a-space>
                  </div>
                  <div class="editor-wrapper">
                    <vue-monaco-editor v-model:value="jsonText" language="json" theme="vs-dark"
                      :options="editorOptions" />
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="monitor" title="Monitor">
              <div class="monitor-container">
                <div class="run-status-section">
                  <div class="section-header">
                    <span class="title">Run Status</span>
                  </div>
                  <div class="status-content">
                    <a-descriptions size="small" :column="2" :bordered="false">
                      <a-descriptions-item label="Status">
                        <a-tag :color="runStateColor">{{ runState }}</a-tag>
                      </a-descriptions-item>
                      <a-descriptions-item label="RunId">{{ runId || '-' }}</a-descriptions-item>
                      <a-descriptions-item label="Progress">
                        <a-progress v-if="progress" :percent="progress.currentStepIndex / progress.totalSteps"
                          :text="`${progress.currentStepIndex + 1} / ${progress.totalSteps}`" size="small"
                          style="width: 200px" />
                        <span v-else>-</span>
                      </a-descriptions-item>
                      <a-descriptions-item label="Current Flow">{{ selectedFlowName || '-' }}</a-descriptions-item>
                    </a-descriptions>
                  </div>
                </div>

                <div class="monitor-logs">
                  <div class="section-header">
                    <span class="title">Execution Logs</span>
                  </div>
                  <a-list :max-height="300" size="small">
                    <a-list-item v-for="(l, idx) in runLogs" :key="idx">
                      <div class="log-item">
                        <span class="log-ts">{{ formatTs(l.ts) }}</span>
                        <span class="log-level" :class="l.level">{{ l.level }}</span>
                        <span class="log-msg">{{ l.message }}</span>
                      </div>
                    </a-list-item>
                  </a-list>
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
          <span class="status-item">Engine: {{ localTools.length ? localTools.join(', ') : '-' }}</span>
          <a-divider direction="vertical" />
          <span class="status-item">Connection:
            <a-badge status="processing" v-if="engineStatusText === 'RUNNING'" text="RUNNING" />
            <a-badge status="default" v-else text="IDLE" />
          </span>
          <template v-if="progress">
            <a-divider direction="vertical" />
            <span class="status-item">Progress: {{ progress.currentStepIndex + 1 }}/{{ progress.totalSteps }}</span>
          </template>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { ipc } from '@/utils/ipcRenderer'
import type { AutoFlowConfig, AutoFlowStep, AutoFlowSummary, EngineData } from '../types'
import { useAutoFlow } from '../composables/useAutoFlow'
import FlowGraphEditor from './flow/FlowGraphEditor.vue'

const props = defineProps<{
  visible: boolean
  engines: EngineData[]
  smlFiles: string[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
}>()

const {
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
} = useAutoFlow()

const selectedFlowName = ref<string | null>(null)

const localName = ref<string>('')
const localTools = ref<string[]>([])
const localSteps = ref<AutoFlowStep[]>([])

const jsonText = ref<string>('')

const allEngines = computed(() => props.engines)

const engineStatusText = computed(() => {
  const tools = localTools.value
  if (!tools.length) return '-'
  const selected = props.engines.filter((x) => tools.includes(x.name))
  if (!selected.length) return '-'
  const activeCount = selected.filter((x) => x.active).length
  return activeCount === selected.length ? 'RUNNING' : 'IDLE'
})

const runStateColor = computed(() => {
  switch (runState.value) {
    case 'running': return 'green'
    case 'paused': return 'orange'
    case 'error': return 'red'
    case 'completed': return 'blue'
    default: return 'gray'
  }
})

const canEdit = computed(() => runState.value !== 'running' && runState.value !== 'paused')
const canRun = computed(() => {
  if (!selectedFlowName.value) return false
  if (!localTools.value.length) return false
  const selected = props.engines.filter((x) => localTools.value.includes(x.name))
  if (!selected.length) return false
  return selected.every((e) => String(e.config?.simulate || '') === 'Equipment')
})
const canPause = computed(() => runState.value === 'running')
const canResume = computed(() => runState.value === 'paused')
const canStop = computed(() => runState.value === 'running' || runState.value === 'paused')

const uniqueNonEmptyStrings = (arr: unknown): string[] => {
  if (!Array.isArray(arr)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const v of arr) {
    const s = String(v || '').trim()
    if (!s) continue
    if (seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }
  return out
}

const normalizeFlowForJson = (flow: AutoFlowConfig): AutoFlowConfig => {
  const tools = uniqueNonEmptyStrings(flow.tools?.length ? flow.tools : flow.tool ? [flow.tool] : [])
  const normalizeStepForJson = (step: AutoFlowStep): AutoFlowStep => {
    const stepTools = uniqueNonEmptyStrings((step as any)?.tools)
    const stepToolsField =
      stepTools.length && !(stepTools.length === tools.length && stepTools.every((x, idx) => x === tools[idx]))
        ? { tools: stepTools }
        : {}
    if (step.type === 'send') {
      return {
        type: 'send',
        ...stepToolsField,
        filePath: String(step.filePath || ''),
        ...(typeof step.waitReply === 'boolean' ? { waitReply: step.waitReply } : {}),
        ...(typeof step.timeoutMs === 'number' ? { timeoutMs: step.timeoutMs } : {}),
        ...(step.expect && typeof step.expect === 'object' ? { expect: step.expect } : {})
      }
    }
    if (step.type === 'wait') {
      return {
        type: 'wait',
        ...stepToolsField,
        expect: step.expect,
        ...(typeof step.timeoutMs === 'number' ? { timeoutMs: step.timeoutMs } : {})
      }
    }
    if (step.type === 'delay') {
      return { type: 'delay', ms: step.ms }
    }
    if (step.type === 'log') {
      return {
        type: 'log',
        ...(step.level ? { level: step.level } : {}),
        message: String(step.message || '')
      }
    }
    return { type: 'end' }
  }
  const next: AutoFlowConfig = {
    name: String(flow.name || '').trim(),
    tools,
    steps: Array.isArray(flow.steps) ? flow.steps.map(normalizeStepForJson) : []
  }
  if (flow.version != null) next.version = flow.version
  if (flow.createdAt) next.createdAt = flow.createdAt
  if (flow.description) next.description = flow.description
  return next
}

const editorOptions = {
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 13,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  theme: 'vs-dark'
}

const formatTs = (ts: number) => {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString() + '.' + String(d.getMilliseconds()).padStart(3, '0')
  } catch (_) {
    return ''
  }
}

const buildLocalFlowObject = (): AutoFlowConfig => {
  const tools = uniqueNonEmptyStrings(localTools.value)
  return {
    version: currentFlow.value?.version,
    name: String(localName.value || '').trim(),
    tool: tools[0] || undefined,
    tools,
    steps: localSteps.value
  }
}

const syncJsonFromLocal = () => {
  const flow = normalizeFlowForJson(buildLocalFlowObject())
  jsonText.value = JSON.stringify(flow, null, 2)
}

const applyJsonToLocal = () => {
  try {
    const obj = JSON.parse(String(jsonText.value || '{}')) as AutoFlowConfig
    if (!obj || typeof obj !== 'object') throw new Error('JSON is not an object')
    localName.value = String(obj.name || '')
    localTools.value = uniqueNonEmptyStrings(Array.isArray(obj.tools) ? obj.tools : obj.tool ? [obj.tool] : [])
    localSteps.value = Array.isArray(obj.steps) ? (obj.steps as AutoFlowStep[]) : []
    currentFlow.value = { ...obj, tools: localTools.value }
    currentFlowName.value = obj.name || null
    Message.success('JSON applied successfully')
  } catch (error: any) {
    const msg = error?.message || 'JSON parsing failed'
    Message.error(msg)
  }
}

const setLocalFromFlow = (flow: AutoFlowConfig) => {
  localName.value = String(flow.name || '')
  localTools.value = uniqueNonEmptyStrings(Array.isArray(flow.tools) ? flow.tools : flow.tool ? [flow.tool] : [])
  localSteps.value = Array.isArray(flow.steps) ? [...flow.steps] : []
  jsonText.value = JSON.stringify(normalizeFlowForJson(flow), null, 2)
}

const selectFlow = async (name: string) => {
  selectedFlowName.value = name
  await loadFlow(name)
  if (currentFlow.value) {
    setLocalFromFlow(currentFlow.value)
  }
}

const handleNewFlow = () => {
  resetRunView()
  selectedFlowName.value = null
  const tool = props.engines.find((e) => String(e.config?.simulate || '') === 'Equipment')?.name || ''
  const firstSml = props.smlFiles[0] || ''
  const flow: AutoFlowConfig = {
    name: 'NewFlow',
    tool: tool || undefined,
    tools: tool ? [tool] : [],
    steps: [
      {
        type: 'send',
        filePath: firstSml,
        timeoutMs: 30000,
        expect: { sf: 'S6F12' }
      }
    ]
  }
  currentFlow.value = flow
  setLocalFromFlow(flow)
}

const handleSave = async () => {
  const flow = buildLocalFlowObject()
  if (!flow.name) {
    Message.error('Flow name cannot be empty')
    return
  }
  if (!flow.tools.length) {
    Message.error('Please select at least one equipment engine')
    return
  }
  if (!Array.isArray(flow.steps) || flow.steps.length === 0) {
    Message.error('At least one step is required')
    return
  }
  if (flow.steps[0]?.type !== 'send') {
    Message.error('The first step must be send (to trigger the flow start)')
    return
  }
  await saveFlow(flow)
  selectedFlowName.value = flow.name
  await loadFlows()
}

const handleDelete = async () => {
  if (!selectedFlowName.value) return
  await deleteFlow(selectedFlowName.value)
  selectedFlowName.value = null
  currentFlow.value = null
  localName.value = ''
  localTools.value = []
  localSteps.value = []
  jsonText.value = ''
}

const handleRun = async () => {
  if (!selectedFlowName.value) {
    Message.error('Please save and select a flow first')
    return
  }
  const selected = props.engines.filter((e) => localTools.value.includes(e.name))
  const inactive = selected.filter((e) => !e.active).map((e) => e.name)
  if (inactive.length) {
    Message.error(`Engine not active: ${inactive.join(', ')}`)
    return
  }
  await handleSave()
  await runFlow(selectedFlowName.value)
  Message.success('Flow started successfully')
}

const handleRefresh = async () => {
  await loadFlows()
}

const handleClose = () => {
  emit('update:visible', false)
}

watch(
  () => props.visible,
  async (v) => {
    if (v) {
      await loadFlows()
      if (!selectedFlowName.value && flowList.value.length > 0) {
        const first = flowList.value.find((x: AutoFlowSummary) => !x.invalid) || flowList.value[0]
        if (first) {
          await selectFlow(first.name)
        }
      }
      if (!selectedFlowName.value) {
        handleNewFlow()
      }
    } else {
      resetRunView()
    }
  }
)

watch(
  [localName, localTools],
  () => {
    if (props.visible && runState.value !== 'running') {
      const allowed = new Set(localTools.value)
      for (const s of localSteps.value as any[]) {
        if ((s.type === 'send' || s.type === 'wait') && Array.isArray(s.tools) && s.tools.length) {
          const filtered = uniqueNonEmptyStrings(s.tools).filter((x) => allowed.has(x))
          s.tools = filtered.length ? filtered : undefined
        }
      }
      syncJsonFromLocal()
    }
  },
  { deep: true }
)

watch(
  localSteps,
  () => {
    if (props.visible && runState.value !== 'running') {
      syncJsonFromLocal()
    }
  },
  { deep: true }
)

onMounted(() => {
  if (ipc) {
    ipc.on('autoflow/event', (_event, payload: any) => {
      handleRunEvent(payload)
    })
  }
})

onBeforeUnmount(() => {
  if (ipc) {
    ipc.removeAllListeners('autoflow/event')
  }
})
</script>

<style scoped lang="less">
/* Layout Container */
.autoflow-layout {
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-bg-1);
}

/* Left Panel */
.left-panel {
  flex: 0 0 220px;
  width: 220px;
  border-right: 1px solid var(--color-border);
  background: var(--color-bg-2);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;

  .title {
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text-1);
  }
}

.flow-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.flow-item {
  cursor: pointer;
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--color-fill-2);
  }

  &.active {
    background-color: var(--color-primary-light-1);

    .flow-name {
      color: rgb(var(--primary-6));
      font-weight: 600;
    }
  }
}

.flow-item-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.flow-name {
  font-size: 14px;
  color: var(--color-text-1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flow-sub {
  font-size: 12px;
  color: var(--color-text-3);
}

/* Right Panel */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  min-width: 0;
}

.top-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-2);
  flex-shrink: 0;
  gap: 12px;
  flex-wrap: wrap;
}

.tool-select {
  width: 200px;
}

.name-input {
  width: 240px;
}

.work-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  background-color: var(--color-bg-1);

  :deep(.arco-tabs) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :deep(.arco-tabs-content) {
    flex: 1;
    overflow: hidden;
    padding-top: 12px;
  }

  :deep(.arco-tabs-pane) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
}

/* Config Tab */
.config-container {
  display: flex;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.steps-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.json-section {
  flex: 0 0 350px;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-fill-1);
  flex-shrink: 0;

  .title {
    font-weight: 600;
    font-size: 13px;
  }
}

.graph-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.param-cell {
  display: flex;
  gap: 8px;
  align-items: center;

  .unit {
    color: var(--color-text-3);
    font-size: 12px;
  }
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.editor-wrapper :deep(.monaco-editor),
.editor-wrapper :deep(.monaco-editor .monaco-editor-background),
.editor-wrapper :deep(.monaco-editor .overflow-guard) {
  width: 100%;
  height: 100%;
}

/* Monitor Tab */
.monitor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow: hidden;
}

.run-status-section {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.status-content {
  padding: 12px;
}

.monitor-logs {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-2);
  border-radius: 4px;
  overflow: hidden;
  min-height: 0;
}

.log-item {
  display: flex;
  gap: 8px;
  font-family: monospace;
  font-size: 12px;
}

.log-ts {
  color: var(--color-text-3);
  width: 100px;
  flex-shrink: 0;
}

.log-level {
  width: 50px;
  font-weight: bold;
  flex-shrink: 0;

  &.ERROR {
    color: rgb(var(--danger-6));
  }

  &.WARN {
    color: rgb(var(--warning-6));
  }

  &.INFO {
    color: rgb(var(--primary-6));
  }
}

.log-msg {
  color: var(--color-text-1);
  word-break: break-all;
}

/* Status Bar */
.status-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-2);
  font-size: 12px;
  color: var(--color-text-2);
  flex-shrink: 0;

  .status-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
