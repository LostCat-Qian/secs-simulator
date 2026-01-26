<template>
  <div class="app-container">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <a-button type="text" @click="openEventBindModal">
          <template #icon>
            <icon-link />
          </template>
          <template #default>{{ t('toolbar.eventBind') }}</template>
        </a-button>
        <a-button type="text" @click="handleAutoFlow">
          <template #icon>
            <icon-link />
          </template>
          <template #default>{{ t('toolbar.autoFlow') }}</template>
        </a-button>
      </div>
      <div class="toolbar-right">
        <LanguageSwitcher />
        <img src="../../assets/logo.png" alt="Logo" class="app-logo" />
        <span class="app-title">{{ t('toolbar.appTitle') }}</span>
      </div>
    </div>

    <!-- Top Divider -->
    <div class="top-divider"></div>

    <a-layout class="main-layout">
      <!-- Left Sidebar: Engines & Files -->
      <a-layout-sider :resize-directions="['right']" :width="320" class="left-sider">
        <div class="sider-content">
          <!-- Engines List Area -->
          <a-resize-box :directions="['bottom']" class="engine-box">
            <EngineList :engines="engineList" @add="openAddEngineModal" @select="selectEngine" @open="handleOpenEngine"
              @close="handleCloseEngine" @edit="handleEditEngine" @delete="handleDeleteEngine"
              @viewConfig="handleViewConfig" />
          </a-resize-box>

          <!-- File Tree Area -->
          <div class="file-tree-wrapper">
            <FileTree :tree-data="fileTreeData" :engines="engineList" @edit="handleEditFile" @delete="handleDeleteFile"
              @sendTo="handleSendFileTo" @selectFile="handlePreviewFile" @addFile="handleAddFile"
              @addFolder="handleAddFolder" @addRootFile="handleAddRootFile" @addRootFolder="openAddRootFolderModal"
              @refresh="loadFileTree" />
          </div>

          <!-- File Preview Area -->
          <div class="file-preview-wrapper">
            <a-resize-box :directions="['top']" class="file-preview-box">
              <FilePreview :content="filePreviewContent" />
            </a-resize-box>
          </div>
        </div>
      </a-layout-sider>

      <!-- Main Content: Logs & Auto Reply -->
      <a-layout-content class="main-content">
        <!-- Logs Area -->
        <div class="logs-wrapper">
          <div class="logs-header">
            <span class="title">{{ t('logs.title') }}</span>
          </div>
          <div class="logs-container">
            <!-- Single Log Panel -->
            <template v-if="logPanels.length === 1">
              <div class="log-panel-item single-panel">
                <LogPanel :title="logPanels[0].title" :logs="logPanels[0].logs" @clear="clearLogs(logPanels[0].id)"
                  @close="handleCloseLogPanel(logPanels[0].id)" />
              </div>
            </template>
            <!-- Multiple Log Panels -->
            <template v-else-if="logPanels.length > 1">
              <a-resize-box v-for="panel in logPanels" :key="panel.id" :directions="['right']" class="log-panel-item"
                :style="{ flex: '0 1 auto', width: panel.width, minWidth: '200px' }" :min-width="200">
                <LogPanel :title="panel.title" :logs="panel.logs" @clear="clearLogs(panel.id)"
                  @close="handleCloseLogPanel(panel.id)" />
              </a-resize-box>
            </template>
            <!-- No Log Panels -->
            <template v-else>
              <div class="empty-logs">
                <a-empty :description="t('logs.noPanel')" />
              </div>
            </template>
          </div>
        </div>

        <a-resize-box :directions="['top']" class="auto-reply-box">
          <AutoReplyPanel :data="tableData" v-model:searchText="searchText" @add="addAutoReply" @edit="editAutoReply"
            @delete="handleDeleteAutoReply" @refresh="loadAutoReplyScripts" />
        </a-resize-box>
      </a-layout-content>
    </a-layout>

    <!-- Modals -->
    <AddEngineModal v-model:visible="addEngineModalVisible"
      :initial-data="editingEngine ? editingEngine.config : undefined" :existing-names="engineList.map(e => e.name)"
      @submit="handleAddEngine" />

    <FileEditorModal v-model:visible="fileEditorModalVisible" :file-name="editingFileName"
      :initial-content="editingFileContent" :editable-name="isCreateMode" @save="handleSaveFile" />

    <AddFolderModal v-model:visible="addRootFolderModalVisible" @submit="confirmAddRootFolder" />
    <AddFolderModal v-model:visible="addSubFolderModalVisible" @submit="confirmAddSubFolder" />

    <AutoReplyModal v-model:visible="autoReplyModalVisible" :initial-data="autoReplyForm" :engines="engineList"
      @submit="handleSaveAutoReply" />

    <AutoFlowDrawer v-model:visible="autoFlowDrawerVisible" :engines="engineList" :sml-files="allSmlFiles" />

    <EventBindModal v-model:visible="eventBindModalVisible" @save="handleSaveEventBind" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { TreeNodeData, Message } from '@arco-design/web-vue'
import { IconLink } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/api'

// Components
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import EngineList from './components/EngineList.vue'
import FileTree from './components/FileTree.vue'
import FilePreview from './components/FilePreview.vue'
import LogPanel from './components/LogPanel.vue'
import AutoReplyPanel from './components/AutoReplyPanel.vue'
import AddEngineModal from './components/AddEngineModal.vue'
import FileEditorModal from './components/FileEditorModal.vue'
import AddFolderModal from './components/AddFolderModal.vue'
import AutoReplyModal from './components/AutoReplyModal.vue'
import EventBindModal from './components/EventBindModal.vue'
import AutoFlowDrawer from './components/AutoFlowDrawer.vue'

// Types
import type { EngineData, AutoReplyFormData, AutoReplyItem, SmlTreeNode } from './types'

// Composables
import { useEngine } from './composables/useEngine'
import { useLogPanels } from './composables/useLogPanels'
import { useFileTree } from './composables/useFileTree'
import { useAutoReply } from './composables/useAutoReply'
import { useEventBind } from './composables/useEventBind'

// i18n
const { t } = useI18n()

// #region --- Composables Setup ---
const { engineList, loadEngineConfigs, saveEngineConfig, deleteEngine, startEngine, stopEngine, updateEngineStatus } =
  useEngine()

const { logPanels, addLogPanel, removePanel, clearLogs, addLogEntry } = useLogPanels()

const {
  fileTreeData,
  filePreviewContent,
  editingFileName,
  editingFileContent,
  // editingFilePath,
  isCreateMode,
  // creatingFolderPath,
  loadFileTree,
  createFolder,
  loadFileContent,
  saveFile,
  deleteNode,
  prepareAddFile,
  prepareEditFile
} = useFileTree()

const {
  tableData,
  defaultAutoReplyScript,
  loadAutoReplyScripts,
  getScriptDetail,
  saveAutoReplyScript,
  deleteAutoReplyScript
} = useAutoReply()

const { saveEventBindFiles } = useEventBind()

// #endregion

const allSmlFiles = computed(() => {
  const files: string[] = []
  const walk = (nodes: SmlTreeNode[]) => {
    for (const n of nodes) {
      if (n.isFolder) {
        if (Array.isArray(n.children)) walk(n.children)
      } else if (typeof n.key === 'string') {
        files.push(n.key)
      }
    }
  }
  walk((fileTreeData.value || []) as SmlTreeNode[])
  return files
})

// #region --- Local State ---

// Engine Modal State
const addEngineModalVisible = ref(false)
const editingEngine = ref<EngineData | null>(null)
const selectedEngineFileName = ref<string | null>(null)

// File Modal State
const fileEditorModalVisible = ref(false)
const addRootFolderModalVisible = ref(false)
const addSubFolderModalVisible = ref(false)
const creatingSubFolderPath = ref('')

// Auto Reply State
const searchText = ref('')
const autoReplyModalVisible = ref(false)
const autoReplyForm = ref<AutoReplyFormData | null>(null)
const editingAutoReplyName = ref<string | null>(null)

// EventBind State
const eventBindModalVisible = ref(false)

// AutoFlow State
const autoFlowDrawerVisible = ref(false)

// #endregion

// #region --- Engine Handlers ---

const openAddEngineModal = () => {
  editingEngine.value = null
  addEngineModalVisible.value = true
}

const handleEditEngine = (engine: EngineData) => {
  editingEngine.value = engine
  addEngineModalVisible.value = true
}

const handleAddEngine = async (formData: any) => {
  const success = await saveEngineConfig(formData, editingEngine.value)
  if (!success) {
    addEngineModalVisible.value = true
    return
  }
  addEngineModalVisible.value = false
  editingEngine.value = null
}

const handleDeleteEngine = async (engine: EngineData) => {
  await deleteEngine(engine)
}

const selectEngine = (engine: EngineData) => {
  selectedEngineFileName.value = engine.fileName
}

const handleOpenEngine = (engine: EngineData) => {
  startEngine(engine)
  // Add log panel when opening engine
  const index = engineList.value.findIndex((e) => e.fileName === engine.fileName)
  addLogPanel(engine, index)
}

const handleCloseEngine = async (engine: EngineData) => {
  try {
    await stopEngine(engine.name, engine.fileName)
    // Close associated log panels
    const panels = logPanels.value.filter((panel) => panel.engineName === engine.name)
    panels.forEach((panel) => {
      clearLogs(panel.id)
      removePanel(panel.id) // Direct remove without stopping engine again
    })
  } catch (error) {
    // Error handled in useEngine
  }
}

const handleViewConfig = (engine: EngineData) => {
  const pretty = JSON.stringify(engine.config || {}, null, 2)
  filePreviewContent.value = `// Configuration for ${engine.name}\n${pretty}`
}

// #endregion

// #region --- Log Panel Handlers ---

const handleCloseLogPanel = async (panelId: string) => {
  const panel = logPanels.value.find((p) => p.id === panelId)
  if (!panel) return

  const engineName = panel.engineName || ''
  const isEnginePanel = engineName && engineName !== 'All Engines'

  // If it's an engine panel, stop the engine first
  if (isEnginePanel) {
    try {
      await stopEngine(engineName)
    } catch (error) {
      console.error('Failed to stop engine when closing log panel:', error)
      // We still remove the panel even if stop failed?
      // Original code did removePanel() in catch block.
    }
  }

  removePanel(panelId)
}

// #endregion

// #region --- File Tree Handlers ---

const handleAddRootFile = () => {
  prepareAddFile('')
  fileEditorModalVisible.value = true
}

const handleAddFile = (node: TreeNodeData) => {
  const target = node as SmlTreeNode
  prepareAddFile(target.key || '')
  fileEditorModalVisible.value = true
}

const handleEditFile = async (node: TreeNodeData) => {
  await prepareEditFile(node)
  if (editingFileContent.value) {
    fileEditorModalVisible.value = true
  }
}

const handlePreviewFile = async (node: TreeNodeData) => {
  await loadFileContent(node)
}

const handleSaveFile = async (payload: { name: string; content: string }) => {
  const success = await saveFile(payload)
  if (success) {
    fileEditorModalVisible.value = false
  }
}

const handleDeleteFile = async (node: TreeNodeData) => {
  await deleteNode(node)
}

const openAddRootFolderModal = () => {
  addRootFolderModalVisible.value = true
}

const confirmAddRootFolder = async (folderName: string) => {
  const success = await createFolder(folderName)
  if (success) {
    addRootFolderModalVisible.value = false
  }
}

const handleAddFolder = (node: TreeNodeData) => {
  const target = node as SmlTreeNode
  creatingSubFolderPath.value = target.key || ''
  addSubFolderModalVisible.value = true
}

const confirmAddSubFolder = async (folderName: string) => {
  const success = await createFolder(folderName, creatingSubFolderPath.value)
  if (success) {
    addSubFolderModalVisible.value = false
    creatingSubFolderPath.value = ''
  }
}

const handleSendFileTo = async (payload: { file: TreeNodeData; engineName: string }) => {
  const target = payload.file as SmlTreeNode
  const filePath = String(target.key || '')

  if (!ipc) {
    Message.error(t('fileTree.cannotSend'))
    return
  }

  if (!filePath) {
    Message.error(t('fileTree.invalidPath'))
    return
  }

  try {
    const result: any = await ipc.invoke(ipcApiRoute.sendMessageFromFile, {
      name: payload.engineName,
      filePath
    })

    if (result && result.hasReply && result.replySml) {
      Message.success(t('fileTree.sendSuccessWithReply', { file: target.title, engine: payload.engineName }))
    } else {
      Message.success(t('fileTree.sendSuccess', { file: target.title, engine: payload.engineName }))
    }
  } catch (error: any) {
    console.error('Failed to send file to engine:', error)
    const msg = error && typeof error.message === 'string' ? error.message : t('fileTree.cannotSend')
    Message.error(msg)
  }
}

// #endregion

// #region --- Auto Reply Handlers ---

const addAutoReply = () => {
  autoReplyForm.value = {
    tool: engineList.value[0]?.name || '',
    handlerSf: '',
    active: true,
    delaySeconds: 0,
    script: defaultAutoReplyScript
  }
  editingAutoReplyName.value = null
  autoReplyModalVisible.value = true
}

const editAutoReply = async (item: AutoReplyItem) => {
  try {
    const result: any = await getScriptDetail(item.name)
    autoReplyForm.value = {
      tool: String(result.tool || item.tool || ''),
      handlerSf: String(result.sf || item.sf || ''),
      active: Boolean(typeof result.active === 'boolean' ? result.active : item.active),
      delaySeconds: Number.isFinite(Number(result.delaySeconds)) ? Number(result.delaySeconds) : item.delaySeconds,
      script: String(result.code || '')
    }
    editingAutoReplyName.value = item.name
    autoReplyModalVisible.value = true
  } catch (error) {
    console.error('Failed to load auto reply script detail:', error)
    Message.error(t('autoReply.loadFailed'))
  }
}

const handleSaveAutoReply = async (form: AutoReplyFormData) => {
  const success = await saveAutoReplyScript(form, editingAutoReplyName.value)
  if (success) {
    editingAutoReplyName.value = null
    autoReplyModalVisible.value = false
  }
}

const handleDeleteAutoReply = async (item: AutoReplyItem) => {
  await deleteAutoReplyScript(item)
}

// #endregion

// #region --- EventBind Handlers ---

const openEventBindModal = () => {
  eventBindModalVisible.value = true
}

const handleAutoFlow = () => {
  const hasEquip = engineList.value.some((e) => String(e.config?.simulate || '') === 'Equipment')
  if (!hasEquip) {
    Message.warning(t('autoFlow.onlyEquipment'))
    return
  }
  autoFlowDrawerVisible.value = true
}

const handleSaveEventBind = async (payload: { folderPath: string; files: { name: string; content: string }[] }) => {
  try {
    const result = await saveEventBindFiles(payload.folderPath, payload.files)
    Message.success(
      `${t('eventBind.saveSuccess')}\n${t('common.info')}: sml/EventBind/${payload.folderPath}/\n${t('fileTree.fileName')}: ${result.files?.join(
        ', '
      )}`
    )
    loadFileTree()
    return result
  } catch (error: any) {
    console.error('Failed to save EventBind:', error)
    const msg = error?.message || t('eventBind.saveFailed')
    Message.error(msg)
    throw error
  }
}

// #region --- Lifecycle ---

onMounted(() => {
  if (ipc) {
    let currentAutoFlowRunId = ''
    let currentAutoFlowTools: string[] = []

    ipc.on('engine/log', (_event, payload: { name: string; level: string; type: string; message: string }) => {
      // Add log
      addLogEntry(payload.name, payload.level || 'INFO', String(payload.message ?? ''))

      // If engine log comes in but no panel exists, create one
      // Note: addLogPanel checks for duplicates internally
      const engine = engineList.value.find((e) => e.name === payload.name)
      if (engine) {
        // We only auto-add panel if it doesn't exist.
        // But addLogPanel already checks this.
        // However, we need the index.
        const index = engineList.value.indexOf(engine)
        // Maybe we don't force open panel on every log? Original code did:
        // if (targetPanels.length === 0) { addLogPanel(engine); }
        // So yes, it auto-opens.
        addLogPanel(engine, index)
      }

      // Update engine status
      updateEngineStatus(payload.name, payload.type)
    })

    ipc.on('autoflow/event', (_event, payload: any) => {
      if (!payload || typeof payload !== 'object') return
      const type = String(payload.type || '')
      const evtRunId = String(payload.runId || '')
      const toolsFromPayload = Array.isArray(payload.tools)
        ? payload.tools.map((x: any) => String(x || '').trim()).filter((x: string) => x.length > 0)
        : String(payload.tool || '').trim()
          ? [String(payload.tool || '').trim()]
          : []

      if (type === 'created') {
        currentAutoFlowRunId = evtRunId
        currentAutoFlowTools = toolsFromPayload

        for (const toolName of currentAutoFlowTools) {
          const toolEngine = engineList.value.find((e) => e.name === toolName)
          if (!toolEngine?.active) continue
          addLogPanel(toolEngine, engineList.value.indexOf(toolEngine))
          addLogEntry(toolName, 'INFO', `[AutoFlow] created: ${String(payload.flowName || '')}`)
        }
        return
      }

      if (currentAutoFlowRunId && evtRunId && evtRunId !== currentAutoFlowRunId) return

      const tools = currentAutoFlowTools.length ? currentAutoFlowTools : toolsFromPayload

      if (type === 'log') {
        for (const toolName of tools) {
          const toolEngine = engineList.value.find((e) => e.name === toolName)
          if (!toolEngine?.active) continue
          addLogPanel(toolEngine, engineList.value.indexOf(toolEngine))
          addLogEntry(toolName, String(payload.level || 'INFO'), `[AutoFlow] ${String(payload.message ?? '')}`)
        }
        return
      }
      if (type === 'state') {
        for (const toolName of tools) {
          const toolEngine = engineList.value.find((e) => e.name === toolName)
          if (!toolEngine?.active) continue
          addLogPanel(toolEngine, engineList.value.indexOf(toolEngine))
          addLogEntry(toolName, 'INFO', `[AutoFlow] state: ${String(payload.state || '')}`)
        }
        return
      }
      if (type === 'stopped' || type === 'disposed') {
        for (const toolName of tools) {
          const toolEngine = engineList.value.find((e) => e.name === toolName)
          if (!toolEngine?.active) continue
          addLogPanel(toolEngine, engineList.value.indexOf(toolEngine))
          addLogEntry(toolName, 'INFO', `[AutoFlow] ${type}`)
        }
        if (type === 'disposed') {
          currentAutoFlowRunId = ''
          currentAutoFlowTools = []
        }
      }
    })
  }

  loadEngineConfigs()
  loadFileTree()
  loadAutoReplyScripts()
})

onBeforeUnmount(() => {
  if (ipc) {
    ipc.removeAllListeners('engine/log')
    ipc.removeAllListeners('autoflow/event')
  }
})

// #endregion
</script>

<style scoped lang="less">
/* Layout Styles */
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Toolbar Styles */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 48px;
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .app-logo {
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }

  .app-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}

.top-divider {
  margin: 0;
  border: 0;
  height: 1px;
  background-color: var(--color-border);
  flex-shrink: 0;
}

.main-layout {
  flex: 1;
  height: calc(100vh - 49px);
  overflow: hidden;
}

/* Sidebar Styles */
.left-sider {
  min-width: 320px;
  max-width: 500px;
  height: 100%;
  border-right: 1px solid var(--color-border);
}

.sider-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.engine-box {
  height: 200px;
  min-height: 200px;
  flex-shrink: 0;
}

.file-preview-box {
  height: 200px;
  min-height: 200px;
  flex-shrink: 0;
}

.file-tree-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

/* Main Content Styles */
.main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.logs-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.logs-header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-2);
  flex-shrink: 0;

  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}

.logs-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  background-color: #121212;
}

.log-panel-item {
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--color-border);

  &:last-child {
    border-right: none;
  }

  &.single-panel {
    width: 100%;
    flex: 1;
  }
}

.empty-logs {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
}

.auto-reply-box {
  height: 300px;
  min-height: 200px;
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
}
</style>
