<template>
  <a-modal :visible="visible" title="AutoFlow" :mask-closable="false" width="92vw" :footer="false"
    @cancel="handleClose">
    <div class="autoflow-container">
      <div class="left-panel">
        <div class="panel-header">
          <span class="title">流程列表</span>
          <a-button size="mini" type="primary" @click="handleNewFlow">新建</a-button>
        </div>
        <div class="flow-list">
          <a-list :bordered="false" size="small" :split="false">
            <a-list-item v-for="item in flowList" :key="item.fileName"
              :class="['flow-item', { active: item.name === selectedFlowName }]" @click="selectFlow(item.name)">
              <div class="flow-item-main">
                <div class="flow-name">
                  {{ item.name }}
                  <a-tag v-if="item.invalid" size="small" color="red">invalid</a-tag>
                </div>
                <div class="flow-sub">{{ item.tool || '-' }} · {{ item.stepCount }} steps</div>
              </div>
            </a-list-item>
          </a-list>
        </div>
      </div>

      <div class="center-panel">
        <div class="top-toolbar">
          <a-space>
            <a-select v-model="localTool" class="tool-select" placeholder="选择引擎" :disabled="runState === 'running'">
              <a-option v-for="e in allEngines" :key="e.fileName || e.name" :value="e.name"
                :disabled="String(e.config?.simulate || '') !== 'Equipment'">
                {{ e.name }} <span v-if="String(e.config?.simulate || '') !== 'Equipment'">(Host)</span>
              </a-option>
            </a-select>
            <a-input v-model="localName" class="name-input" placeholder="流程名称" :disabled="runState === 'running'" />
          </a-space>

          <a-space>
            <a-button size="small" type="secondary" @click="handleRefresh">刷新</a-button>
            <a-button size="small" type="primary" @click="handleSave" :disabled="!canEdit">保存</a-button>
            <a-button size="small" status="danger" type="dashed" @click="handleDelete"
              :disabled="!canEdit || !selectedFlowName">
              删除
            </a-button>

            <a-divider direction="vertical" />

            <a-button size="small" type="primary" :disabled="!canRun" @click="handleRun">运行</a-button>
            <a-button size="small" type="secondary" :disabled="!canPause" @click="pauseRun">暂停</a-button>
            <a-button size="small" type="secondary" :disabled="!canResume" @click="resumeRun">继续</a-button>
            <a-button size="small" status="danger" type="dashed" :disabled="!canStop" @click="stopRun">停止</a-button>
          </a-space>
        </div>

        <div class="work-area">
          <a-tabs default-active-key="config" size="small">
            <a-tab-pane key="config" title="配置编辑">
              <div class="config-area">
                <div class="steps-area">
                  <div class="steps-header">
                    <span class="title">步骤</span>
                    <a-space>
                      <a-button size="mini" @click="addSendStep">+ Send</a-button>
                      <a-button size="mini" @click="addWaitStep">+ Wait</a-button>
                      <a-button size="mini" @click="addDelayStep">+ Delay</a-button>
                      <a-button size="mini" @click="addLogStep">+ Log</a-button>
                      <a-button size="mini" @click="addEndStep">+ End</a-button>
                    </a-space>
                  </div>

                  <a-table :data="localSteps" :pagination="false" :bordered="{ cell: true }" size="small"
                    :scroll="{ x: 900 }">
                    <template #columns>
                      <a-table-column title="#" :width="50">
                        <template #cell="{ rowIndex }">{{ rowIndex + 1 }}</template>
                      </a-table-column>
                      <a-table-column title="类型" :width="120">
                        <template #cell="{ record }">
                          <a-select v-model="record.type" size="mini" style="width: 110px"
                            :disabled="runState === 'running'">
                            <a-option value="send">send</a-option>
                            <a-option value="wait">wait</a-option>
                            <a-option value="delay">delay</a-option>
                            <a-option value="log">log</a-option>
                            <a-option value="end">end</a-option>
                          </a-select>
                        </template>
                      </a-table-column>
                      <a-table-column title="参数" :width="420">
                        <template #cell="{ record }">
                          <template v-if="record.type === 'send'">
                            <a-select v-model="record.filePath" size="mini" style="width: 260px" placeholder="选择 SML"
                              :disabled="runState === 'running'" allow-search>
                              <a-option v-for="p in smlFiles" :key="p" :value="p">{{ p }}</a-option>
                            </a-select>
                            &nbsp;
                            <a-input :model-value="record.expect?.sf" size="mini" style="width: 120px"
                              placeholder="expect SF" @update:model-value="(v: string) => updateExpectSf(record, v)" />
                          </template>
                          <template v-else-if="record.type === 'wait'">
                            <a-input :model-value="record.expect?.sf" size="mini" style="width: 180px"
                              placeholder="expect SF" @update:model-value="(v: string) => updateExpectSf(record, v)" />
                            &nbsp;
                            <a-input :model-value="record.expect?.smlIncludes" size="mini" style="width: 220px"
                              placeholder="SML 包含..."
                              @update:model-value="(v: string) => updateExpectSmlIncludes(record, v)" />
                          </template>
                          <template v-else-if="record.type === 'delay'">
                            <a-input-number v-model="record.ms" size="mini" :min="0" :step="100" />
                          </template>
                          <template v-else-if="record.type === 'log'">
                            <a-input v-model="record.message" size="mini" style="width: 420px" placeholder="message" />
                          </template>
                          <template v-else-if="record.type === 'end'">-</template>
                        </template>
                      </a-table-column>
                      <a-table-column title="超时(ms)" :width="120">
                        <template #cell="{ record }">
                          <a-input-number v-if="record.type === 'send' || record.type === 'wait'"
                            v-model="record.timeoutMs" size="mini" :min="1000" :step="1000" />
                        </template>
                      </a-table-column>
                      <a-table-column title="操作" :width="120">
                        <template #cell="{ rowIndex }">
                          <a-button size="mini" type="text" @click="moveStepUp(rowIndex)"
                            :disabled="rowIndex === 0">↑</a-button>
                          <a-button size="mini" type="text" @click="moveStepDown(rowIndex)"
                            :disabled="rowIndex === localSteps.length - 1">↓</a-button>
                          <a-button size="mini" type="text" status="danger" @click="removeStep(rowIndex)">✕</a-button>
                        </template>
                      </a-table-column>
                    </template>
                  </a-table>
                </div>

                <div class="json-area">
                  <div class="json-header">
                    <span class="title">高级 JSON</span>
                    <a-space>
                      <a-button size="mini" @click="syncJsonFromLocal">刷新 JSON</a-button>
                      <a-button size="mini" type="primary" @click="applyJsonToLocal">应用 JSON</a-button>
                    </a-space>
                  </div>
                  <div class="editor-wrapper">
                    <vue-monaco-editor v-model:value="jsonText" language="json" theme="vs-dark"
                      :options="editorOptions" />
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="monitor" title="执行监控">
              <div class="monitor-area">
                <a-descriptions size="small" :column="2" bordered>
                  <a-descriptions-item label="状态">{{ runState }}</a-descriptions-item>
                  <a-descriptions-item label="RunId">{{ runId || '-' }}</a-descriptions-item>
                  <a-descriptions-item label="进度">
                    <span v-if="progress">
                      {{ progress.currentStepIndex + 1 }} / {{ progress.totalSteps }}
                    </span>
                    <span v-else>-</span>
                  </a-descriptions-item>
                  <a-descriptions-item label="当前流程">{{ selectedFlowName || '-' }}</a-descriptions-item>
                </a-descriptions>

                <div class="log-view">
                  <a-list size="small" :bordered="true">
                    <a-list-item v-for="(l, idx) in runLogs" :key="idx">
                      <span class="log-ts">{{ formatTs(l.ts) }}</span>
                      <span class="log-level" :class="l.level">{{ l.level }}</span>
                      <span class="log-msg">{{ l.message }}</span>
                    </a-list-item>
                  </a-list>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="logs" title="日志查看">
              <div class="log-view">
                <a-list size="small" :bordered="true">
                  <a-list-item v-for="(l, idx) in runLogs" :key="idx">
                    <span class="log-ts">{{ formatTs(l.ts) }}</span>
                    <span class="log-level" :class="l.level">{{ l.level }}</span>
                    <span class="log-msg">{{ l.message }}</span>
                  </a-list-item>
                </a-list>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>

        <div class="status-bar">
          <span class="status-item">设备引擎：{{ localTool || '-' }}</span>
          <span class="status-item">连接：{{ engineStatusText }}</span>
          <span class="status-item" v-if="progress">
            进度：{{ progress.currentStepIndex + 1 }}/{{ progress.totalSteps }}
          </span>
        </div>
      </div>

    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { ipc } from '@/utils/ipcRenderer'
import type { AutoFlowConfig, AutoFlowStep, AutoFlowSummary, EngineData } from '../types'
import { useAutoFlow } from '../composables/useAutoFlow'

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
const localTool = ref<string>('')
const localSteps = ref<AutoFlowStep[]>([])

const jsonText = ref<string>('')

const allEngines = computed(() => props.engines)

const engineStatusText = computed(() => {
  const name = String(localTool.value || '')
  const e = props.engines.find((x) => x.name === name)
  if (!e) return '-'
  return e.active ? 'RUNNING' : 'IDLE'
})

const canEdit = computed(() => runState.value !== 'running' && runState.value !== 'paused')
const canRun = computed(() => {
  if (!selectedFlowName.value) return false
  if (!localTool.value) return false
  const e = props.engines.find((x) => x.name === localTool.value)
  return !!e && String(e.config?.simulate || '') === 'Equipment'
})
const canPause = computed(() => runState.value === 'running')
const canResume = computed(() => runState.value === 'paused')
const canStop = computed(() => runState.value === 'running' || runState.value === 'paused')

const ensureExpectObject = (record: any) => {
  if (!record.expect || typeof record.expect !== 'object') {
    record.expect = {}
  }
  return record.expect
}

const updateExpectSf = (record: any, value: string) => {
  const expect = ensureExpectObject(record)
  expect.sf = value
  syncJsonFromLocal()
}

const updateExpectSmlIncludes = (record: any, value: string) => {
  const expect = ensureExpectObject(record)
  expect.smlIncludes = value
  syncJsonFromLocal()
}

const editorOptions = {
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'on'
}

const formatTs = (ts: number) => {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString()
  } catch (_) {
    return ''
  }
}

const buildLocalFlowObject = (): AutoFlowConfig => {
  return {
    name: String(localName.value || '').trim(),
    tool: String(localTool.value || '').trim(),
    steps: localSteps.value
  }
}

const syncJsonFromLocal = () => {
  const flow = buildLocalFlowObject()
  jsonText.value = JSON.stringify(flow, null, 2)
}

const applyJsonToLocal = () => {
  try {
    const obj = JSON.parse(String(jsonText.value || '{}')) as AutoFlowConfig
    if (!obj || typeof obj !== 'object') throw new Error('JSON 不是对象')
    localName.value = String(obj.name || '')
    localTool.value = String(obj.tool || '')
    localSteps.value = Array.isArray(obj.steps) ? (obj.steps as AutoFlowStep[]) : []
    currentFlow.value = obj
    currentFlowName.value = obj.name || null
    Message.success('已应用 JSON')
  } catch (error: any) {
    const msg = error?.message || 'JSON 解析失败'
    Message.error(msg)
  }
}

const setLocalFromFlow = (flow: AutoFlowConfig) => {
  localName.value = String(flow.name || '')
  localTool.value = String(flow.tool || '')
  localSteps.value = Array.isArray(flow.steps) ? [...flow.steps] : []
  jsonText.value = JSON.stringify(flow, null, 2)
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
    tool,
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
    Message.error('流程名称不能为空')
    return
  }
  if (!flow.tool) {
    Message.error('请选择设备引擎')
    return
  }
  if (!Array.isArray(flow.steps) || flow.steps.length === 0) {
    Message.error('至少配置一个步骤')
    return
  }
  if (flow.steps[0]?.type !== 'send') {
    Message.error('第一步必须是 send（用于触发流程开始）')
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
  localTool.value = ''
  localSteps.value = []
  jsonText.value = ''
}

const handleRun = async () => {
  if (!selectedFlowName.value) {
    Message.error('请先保存并选择一个流程')
    return
  }
  const engine = props.engines.find((e) => e.name === localTool.value)
  if (!engine?.active) {
    Message.error(`Engine ${String(localTool.value || '')} 未启动`)
    return
  }
  await handleSave()
  await runFlow(selectedFlowName.value)
}

const handleRefresh = async () => {
  await loadFlows()
}

const addSendStep = () => {
  localSteps.value = [
    ...localSteps.value,
    {
      type: 'send',
      filePath: props.smlFiles[0] || '',
      timeoutMs: 30000
    } as AutoFlowStep
  ]
  syncJsonFromLocal()
}

const addWaitStep = () => {
  localSteps.value = [
    ...localSteps.value,
    {
      type: 'wait',
      timeoutMs: 30000,
      expect: { sf: 'S2F41' }
    } as AutoFlowStep
  ]
  syncJsonFromLocal()
}

const addDelayStep = () => {
  localSteps.value = [...localSteps.value, { type: 'delay', ms: 1000 } as AutoFlowStep]
  syncJsonFromLocal()
}

const addLogStep = () => {
  localSteps.value = [...localSteps.value, { type: 'log', level: 'INFO', message: 'log...' } as AutoFlowStep]
  syncJsonFromLocal()
}

const addEndStep = () => {
  localSteps.value = [...localSteps.value, { type: 'end' } as AutoFlowStep]
  syncJsonFromLocal()
}

const removeStep = (idx: number) => {
  localSteps.value = localSteps.value.filter((_, i) => i !== idx)
  syncJsonFromLocal()
}

const moveStepUp = (idx: number) => {
  if (idx <= 0) return
  const arr = [...localSteps.value]
  const t = arr[idx - 1]
  arr[idx - 1] = arr[idx]
  arr[idx] = t
  localSteps.value = arr
  syncJsonFromLocal()
}

const moveStepDown = (idx: number) => {
  if (idx >= localSteps.value.length - 1) return
  const arr = [...localSteps.value]
  const t = arr[idx + 1]
  arr[idx + 1] = arr[idx]
  arr[idx] = t
  localSteps.value = arr
  syncJsonFromLocal()
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

watch([localName, localTool], () => {
  if (props.visible && runState.value !== 'running') {
    syncJsonFromLocal()
  }
})

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
.autoflow-container {
  display: flex;
  height: 78vh;
  gap: 12px;
  min-height: 0;
}

.left-panel {
  flex: 0 0 240px;
  width: 240px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-2);
  display: flex;
  flex-direction: column;
  min-width: 200px;
  min-height: 0;
}

.center-panel {
  flex: 1;
  border: 1px solid var(--color-border);
  background: var(--color-bg-2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);

  .title {
    font-weight: 600;
    font-size: 13px;
  }
}

.flow-list {
  flex: 1;
  overflow: auto;
  padding: 6px;
}

.flow-item {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  user-select: none;

  &.active {
    background: var(--color-fill-2);
  }
}

.flow-item-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.flow-name {
  font-size: 13px;
  color: var(--color-text-1);
}

.flow-sub {
  font-size: 12px;
  color: var(--color-text-3);
}

.top-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
  gap: 8px;
}

.tool-select,
.name-input {
  width: 220px;
  max-width: 100%;
}

.work-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px 10px;
  min-height: 0;
}

.work-area :deep(.arco-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.work-area :deep(.arco-tabs-content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.work-area :deep(.arco-tabs-content-item) {
  height: 100%;
  min-height: 0;
}

.status-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-3);

  .status-item {
    white-space: nowrap;
  }
}

.config-area {
  display: flex;
  gap: 10px;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.steps-area {
  flex: 1 1 520px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  min-height: 0;
}

.steps-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0 10px 0;

  .title {
    font-weight: 600;
  }
}

.json-area {
  flex: 1 1 420px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0 10px 0;

  .title {
    font-weight: 600;
  }
}

.editor-wrapper {
  flex: 1;
  border: 1px solid var(--color-border);
  overflow: hidden;
  min-height: 400px;
}

.editor-wrapper :deep(.monaco-editor),
.editor-wrapper :deep(.monaco-editor .monaco-editor-background),
.editor-wrapper :deep(.monaco-editor .overflow-guard) {
  width: 100%;
  height: 100%;
}

.monitor-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.log-view {
  flex: 1;
  overflow: auto;
}

.log-ts {
  display: inline-block;
  width: 90px;
  color: var(--color-text-3);
}

.log-level {
  display: inline-block;
  width: 60px;
  font-weight: 600;

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
}

@media (max-width: 1100px) {
  .autoflow-container {
    flex-direction: column;
    height: 80vh;
  }

  .left-panel {
    width: 100%;
    flex: 0 0 auto;
    max-height: 28vh;
    min-width: 0;
  }

  .config-area {
    flex-direction: column;
    height: 100%;
  }

  .tool-select,
  .name-input {
    width: 100%;
  }
}
</style>
