<template>
  <div class="app-container">
    <!-- Top Divider -->
    <div class="top-divider"></div>

    <a-layout class="main-layout">
      <!-- Left Sidebar: Engines & Files -->
      <a-layout-sider :resize-directions="['right']" :width="320" class="left-sider">
        <div class="sider-content">
          <!-- Engines List Area -->
          <a-resize-box :directions="['bottom']" class="engine-box">
            <EngineList :engines="engineList" @add="openAddEngineModal" @select="selectEngine" @open="openEngine"
              @edit="handleEditEngine" @delete="handleDeleteEngine" @viewConfig="handleViewConfig" />
          </a-resize-box>

          <!-- File Tree Area -->
          <div class="file-tree-wrapper">
            <FileTree :tree-data="fileTreeData" :engines="engineList" @edit="handleEditFile" @delete="handleDeleteFile"
              @sendTo="handleSendFileTo" />
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
            <span class="title">Logs</span>
          </div>
          <div class="logs-container">
            <!-- Single Log Panel -->
            <template v-if="logPanels.length === 1">
              <div class="log-panel-item single-panel">
                <LogPanel :title="logPanels[0].title" :logs="logPanels[0].logs" @clear="clearLogs(logPanels[0].id)"
                  @close="closeLogPanel(logPanels[0].id)" />
              </div>
            </template>
            <!-- Multiple Log Panels -->
            <template v-else-if="logPanels.length > 1">
              <a-resize-box v-for="panel in logPanels" :key="panel.id" :directions="['right']" class="log-panel-item"
                :style="{ flex: '0 1 auto', width: panel.width, minWidth: '200px' }" :min-width="200">
                <LogPanel :title="panel.title" :logs="panel.logs" @clear="clearLogs(panel.id)"
                  @close="closeLogPanel(panel.id)" />
              </a-resize-box>
            </template>
            <!-- No Log Panels -->
            <template v-else>
              <div class="empty-logs">
                <a-empty description="No logs opened" />
              </div>
            </template>
          </div>
        </div>

        <!-- Auto Reply Area -->
        <a-resize-box :directions="['top']" class="auto-reply-box">
          <AutoReplyPanel :data="tableData" v-model:searchText="searchText" @add="addAutoReply" />
        </a-resize-box>
      </a-layout-content>
    </a-layout>

    <!-- Add/Edit Engine Modal -->
    <AddEngineModal v-model:visible="addEngineModalVisible" :initial-data="editingEngine" @submit="handleAddEngine" />

    <!-- File Editor Modal -->
    <FileEditorModal
      v-model:visible="fileEditorModalVisible"
      :file-name="editingFileName"
      :initial-content="editingFileContent"
      @save="handleSaveFile"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Modal, TreeNodeData, Message } from '@arco-design/web-vue';
import EngineList from './components/EngineList.vue';
import FileTree from './components/FileTree.vue';
import FilePreview from './components/FilePreview.vue';
import LogPanel from './components/LogPanel.vue';
import AutoReplyPanel from './components/AutoReplyPanel.vue';
import AddEngineModal from './components/AddEngineModal.vue';
import FileEditorModal from './components/FileEditorModal.vue';

/**
 * Interface Definitions
 */

interface LogEntry {
  time: string;
  level: string;
  message: string;
}

interface LogPanelData {
  id: string;
  title: string;
  engineId?: string;
  engineName?: string;
  width: string; // Width percentage or value
  logs: LogEntry[];
}

interface EngineData {
  name: string;
  active: boolean;
  // Add other engine properties as needed
}

// #region --- State Management ---

// Engine List State
const engineList = ref<EngineData[]>([
  { name: '1. TOOL_CONTROL_LINK', active: true },
  { name: '01_S6F11_CassetteAr', active: false },
  { name: '02_S6F11_CassetteAr', active: false },
  { name: '03_S6F11_Clam', active: false },
  { name: 'S1F18_CarrierActio', active: false }
]);

// File Tree State
const fileTreeData = ref<TreeNodeData[]>([
  {
    title: 'configs',
    key: 'configs',
    isFolder: true,
    children: [
      { title: 'engine.config', key: 'engine-config', isFolder: false },
      { title: 'messages.config', key: 'messages-config', isFolder: false }
    ]
  },
  {
    title: 'handlers',
    key: 'handlers',
    isFolder: true,
    children: [
      { title: 'S1F13.js', key: 's1f13', isFolder: false },
      { title: 'S1F14.js', key: 's1f14', isFolder: false },
      { title: 'S6F11.js', key: 's6f11', isFolder: false }
    ]
  },
  {
    title: 'logs',
    key: 'logs',
    isFolder: true,
    children: [
      { title: '2025-12-31.log', key: 'log-2025-12-31', isFolder: false }
    ]
  }
]);

// File Preview State
const filePreviewContent = ref(`// Engine Configuration
{
  "name": "TOOL_CONTROL_LINK",
  "deviceId": "EQ_CVD_001",
  "ip": "192.168.1.105",
  "port": 5000,
  "timeout": 30,
  "retryCount": 3
}`);

// Log Panels State
const logPanels = ref<LogPanelData[]>([
  {
    id: '1',
    title: 'Real-time Logs',
    engineId: '',
    engineName: 'All Engines',
    width: '100%',
    logs: [
      { time: '14:30:05', level: 'INFO', message: 'Connection established with EQ_CVD_001' },
      { time: '14:30:06', level: 'INFO', message: 'Received S1F13 message from equipment' },
      { time: '14:30:07', level: 'DEBUG', message: 'Processing S1F14 reply message' },
      { time: '14:30:08', level: 'WARN', message: 'T3 timeout detected, retrying...' },
      { time: '14:30:09', level: 'INFO', message: 'S1F14 message sent successfully' },
      { time: '14:30:11', level: 'ERROR', message: 'Connection lost, attempting to reconnect...' }
    ]
  }
]);

// Auto Reply State
const searchText = ref('');
const tableData = ref([
  { tool: 'EQ_CVD_001', handlerSfName: 'S1F13', id: '201', replySfName: 'S1F14', delayTime: '0.5s', status: 'Active' },
  { tool: 'EQ_CVD_001', handlerSfName: 'S2F41', id: '0', replySfName: 'S2F42', delayTime: '1.0s', status: 'Standby' },
  { tool: 'EQ_ETCH_02', handlerSfName: 'S6F11', id: '1', replySfName: 'S6F12', delayTime: '0s', status: 'Listening' },
]);

// Modal State
const addEngineModalVisible = ref(false);
const editingEngine = ref<any>(null);

// File Editor Modal State
const fileEditorModalVisible = ref(false);
const editingFileName = ref('');
const editingFileContent = ref('');

// #endregion

// #region --- Methods: Log Management ---

let panelCounter = 1;

/**
 * Redistributes the width of all log panels evenly.
 */
const redistributePanelWidths = () => {
  const count = logPanels.value.length;
  if (count === 1) {
    logPanels.value[0].width = '100%';
  } else {
    const percentage = 100 / count;
    logPanels.value.forEach(panel => {
      panel.width = `${percentage}%`;
    });
  }
};

/**
 * Adds a new log panel for a specific engine.
 * @param engine The engine to add a log panel for
 */
const addLogPanel = (engine: EngineData) => {
  panelCounter++;
  const newPanel: LogPanelData = {
    id: String(panelCounter),
    title: `${engine.name} Logs`,
    engineId: String(engineList.value.indexOf(engine)),
    engineName: engine.name,
    width: '0%', // Will be recalculated
    logs: []
  };
  logPanels.value.push(newPanel);
  redistributePanelWidths();
  Message.success(`Log Panel ${panelCounter} added for ${engine.name}`);
};

/**
 * Closes a log panel by ID.
 * @param panelId The ID of the panel to close
 */
const closeLogPanel = (panelId: string) => {
  const index = logPanels.value.findIndex(panel => panel.id === panelId);
  if (index > -1) {
    logPanels.value.splice(index, 1);
    redistributePanelWidths();
    Message.success('Log panel closed');
  }
};

/**
 * Clears logs for a specific panel.
 * @param panelId The ID of the panel to clear
 */
const clearLogs = (panelId: string) => {
  const panel = logPanels.value.find(p => p.id === panelId);
  if (panel) {
    panel.logs = [];
    Message.success('Logs cleared');
  }
};

// #endregion

// #region --- Methods: Engine Management ---

const openAddEngineModal = () => {
  editingEngine.value = null;
  addEngineModalVisible.value = true;
};

const handleAddEngine = (formData: any) => {
  console.log('Engine Data:', formData);

  if (editingEngine.value) {
    // Edit mode: update existing engine
    const index = engineList.value.indexOf(editingEngine.value);
    if (index > -1) {
      engineList.value[index] = { ...engineList.value[index], name: formData.name };
      Message.success(`Engine "${formData.name}" updated`);
    }
  } else {
    // Add mode: create new engine
    engineList.value.push({
      name: formData.name,
      active: false
    });
    Message.success(`Engine "${formData.name}" added`);
  }

  addEngineModalVisible.value = false;
  editingEngine.value = null;
};

const selectEngine = (engine: EngineData) => {
  console.log('Selected engine:', engine);
  // Implementation for selecting an engine (e.g., highlighting)
};

const openEngine = (engine: EngineData) => {
  console.log('Open engine:', engine);
  addLogPanel(engine);
};

const handleEditEngine = (engine: EngineData) => {
  console.log('Edit engine:', engine);
  editingEngine.value = engine;
  addEngineModalVisible.value = true;
};

const handleDeleteEngine = (engine: EngineData) => {
  Modal.confirm({
    title: 'Delete Engine',
    content: `Are you sure you want to delete ${engine.name}?`,
    onOk: () => {
      const index = engineList.value.indexOf(engine);
      if (index > -1) {
        engineList.value.splice(index, 1);
        Message.success('Engine deleted');
      }
    }
  });
};

const handleViewConfig = (engine: EngineData) => {
  console.log('View config:', engine);
  // Mock: update preview content
  filePreviewContent.value = `// Configuration for ${engine.name}\n{\n  "mode": "Active",\n  "protocol": "SECS-II"\n}`;
};

// #endregion

// #region --- Methods: File Management ---

const handleEditFile = (node: TreeNodeData) => {
  console.log('Edit file:', node);

  // Mock: Get file content based on file name
  // In a real app, you would fetch the actual file content from the backend
  const mockFileContents: Record<string, string> = {
    'engine.config': `// Engine Configuration
{
  "name": "TOOL_CONTROL_LINK",
  "deviceId": "EQ_CVD_001",
  "ip": "192.168.1.105",
  "port": 5000,
  "timeout": 30,
  "retryCount": 3
}`,
    'messages.config': `// Messages Configuration
{
  "enabledMessages": [
    "S1F13",
    "S1F14",
    "S6F11",
    "S6F12"
  ],
  "timeout": 5000
}`,
    'S1F13.js': `/**
 * S1F13 Handler - Establish Communications
 * @param {Object} message - The incoming SECS message
 * @returns {Object} The reply message
 */
function handleS1F13(message) {
  console.log('Received S1F13:', message);

  // Process the message
  const reply = {
    stream: 1,
    function: 14,
    text: 'OK'
  };

  return reply;
}

module.exports = handleS1F13;`,
    'S1F14.js': `/**
 * S1F14 Handler - Establish Communications Reply
 * @param {Object} message - The incoming SECS message
 * @returns {Object} The reply message
 */
function handleS1F14(message) {
  console.log('Received S1F14:', message);

  // Process the message
  const reply = {
    stream: 1,
    function: 0,
    text: 'ACK'
  };

  return reply;
}

module.exports = handleS1F14;`,
    'S6F11.js': `/**
 * S6F11 Handler - Event Report
 * @param {Object} message - The incoming SECS message
 * @returns {Object} The reply message
 */
function handleS6F11(message) {
  console.log('Received S6F11:', message);

  // Process the message
  const reply = {
    stream: 6,
    function: 12,
    ackc: 0
  };

  return reply;
}

module.exports = handleS6F11;`,
    '2025-12-31.log': `[2025-12-31 14:30:05] INFO: Connection established with EQ_CVD_001
[2025-12-31 14:30:06] INFO: Received S1F13 message from equipment
[2025-12-31 14:30:07] DEBUG: Processing S1F14 reply message
[2025-12-31 14:30:08] WARN: T3 timeout detected, retrying...
[2025-12-31 14:30:09] INFO: S1F14 message sent successfully
[2025-12-31 14:30:11] ERROR: Connection lost, attempting to reconnect...`
  };

  // Get file content or use default
  const content = mockFileContents[node.title as string] || `// ${node.title}\n// File content here`;

  editingFileName.value = node.title as string;
  editingFileContent.value = content;
  fileEditorModalVisible.value = true;
};

const handleSaveFile = (content: string) => {
  console.log('Saving file:', editingFileName.value);
  console.log('Content:', content);

  // Mock: Save file to backend
  // In a real app, you would send the content to the backend via IPC
  Message.success(`File "${editingFileName.value}" saved successfully`);

  // Update preview content if it's the same file
  // filePreviewContent.value = content;
};

const handleDeleteFile = (node: TreeNodeData) => {
  console.log('Delete file:', node);
  Modal.confirm({
    title: 'Delete File',
    content: `Are you sure you want to delete ${node.title}?`,
    onOk: () => {
      Message.success('File deleted');
      // Note: Actual deletion logic from treeData needs to be implemented recursively
    }
  });
};

const handleSendFileTo = (payload: { file: TreeNodeData, engineName: string }) => {
  console.log(`Sending ${payload.file.title} to ${payload.engineName}`);
  Message.success(`Sent ${payload.file.title} to ${payload.engineName}`);
};

// #endregion

// #region --- Methods: Auto Reply ---

const addAutoReply = () => {
  console.log('Add auto reply');
  Message.info('Add Auto Reply dialog would open here');
};

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

.top-divider {
  margin: 0;
  border: 0;
  height: 1px;
  background-color: var(--color-border);
  flex-shrink: 0;
}

.main-layout {
  flex: 1;
  height: calc(100vh - 1px);
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
  height: 300px;
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
