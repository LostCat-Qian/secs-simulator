<template>
  <div class="app-container">
    <hr style="margin: 0; border: 0; height: 1px; background-color: var(--color-border);" />
    <a-layout style="height: 100vh;">
      <a-layout-sider :resize-directions="['right']" :width="320"
        style="min-width: 320px; max-width: 500px; height: 100%; border-right: 1px solid var(--color-border);">
        <div class="sider-content">
          <!-- Engines Area -->
          <a-resize-box :directions="['bottom']" style="height: 300px; min-height: 200px; flex-shrink: 0;">
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
            <FilePreview :content="filePreviewContent" />
          </div>
        </div>
      </a-layout-sider>

      <a-layout-content class="main-content">
        <!-- Logs Area -->
        <div class="logs-wrapper">
          <div class="logs-header">
            <span class="title">Logs</span>
          </div>
          <div class="logs-container">
            <template v-if="logPanels.length === 1">
              <div class="log-panel-item single-panel">
                <LogPanel :title="logPanels[0].title" :logs="logPanels[0].logs" @clear="clearLogs(logPanels[0].id)"
                  @close="closeLogPanel(logPanels[0].id)" />
              </div>
            </template>
            <template v-else>
              <a-resize-box v-for="(panel, index) in logPanels" :key="panel.id" :directions="['right']"
                class="log-panel-item" :style="{ flex: '0 1 auto', width: panel.width, minWidth: '200px' }"
                :min-width="200">
                <LogPanel :title="panel.title" :logs="panel.logs" @clear="clearLogs(panel.id)"
                  @close="closeLogPanel(panel.id)" />
              </a-resize-box>
            </template>
          </div>
        </div>

        <!-- Auto Reply Area -->
        <a-resize-box :directions="['top']" style="height: 300px; min-height: 200px; flex-shrink: 0;">
          <AutoReplyPanel :data="tableData" v-model:searchText="searchText" @add="addAutoReply" />
        </a-resize-box>
      </a-layout-content>
    </a-layout>

    <AddEngineModal v-model:visible="addEngineModalVisible" :initial-data="editingEngine" @submit="handleAddEngine" />
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

// Log Panel Management
interface LogPanelData {
  id: string;
  title: string;
  engineId?: string;
  engineName?: string;
  width: string;
  logs: Array<{
    time: string;
    level: string;
    message: string;
  }>;
}

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

let panelCounter = 1;

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

const addLogPanel = (engine: { name: string; active: boolean }) => {
  panelCounter++;
  const newPanel: LogPanelData = {
    id: String(panelCounter),
    title: `${engine.name} Logs`,
    engineId: String(engineList.value.indexOf(engine)),
    engineName: engine.name,
    width: '0%',
    logs: []
  };
  logPanels.value.push(newPanel);
  redistributePanelWidths();
  Message.success(`Log Panel ${panelCounter} added for ${engine.name}`);
};

const closeLogPanel = (panelId: string) => {
  if (logPanels.value.length <= 1) {
    Message.warning('At least one log panel must remain');
    return;
  }
  const index = logPanels.value.findIndex(panel => panel.id === panelId);
  if (index > -1) {
    logPanels.value.splice(index, 1);
    redistributePanelWidths();
    Message.success('Log panel closed');
  }
};

const clearLogs = (panelId: string) => {
  const panel = logPanels.value.find(p => p.id === panelId);
  if (panel) {
    panel.logs = [];
  }
};

// Data State
const engineList = ref([
  { name: '1. TOOL_CONTROL_LINK', active: true },
  { name: '01_S6F11_CassetteAr', active: false },
  { name: '02_S6F11_CassetteAr', active: false },
  { name: '03_S6F11_Clam', active: false },
  { name: 'S1F18_CarrierActio', active: false }
]);

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

const filePreviewContent = ref(`// Engine Configuration
{
  "name": "TOOL_CONTROL_LINK",
  "deviceId": "EQ_CVD_001",
  "ip": "192.168.1.105",
  "port": 5000,
  "timeout": 30,
  "retryCount": 3
}`);

const tableData = ref([
  { tool: 'HIRATA', handlerSfName: 'SIF3', id: '#0^0', replySfName: 'SIF4-105', delayTime: '0 ms', status: 'Active' },
  { tool: 'CANON', handlerSfName: 'SIF3', id: '122001#0', replySfName: 'SIF4_Reticile', delayTime: '0 ms', status: 'Standby' },
  { tool: 'CANON', handlerSfName: 'S7F19', id: '-', replySfName: 'S7F20_CANON', delayTime: '10 ms', status: 'Standby' },
  { tool: 'HIRATA', handlerSfName: 'S16F15', id: '-', replySfName: 'S16F16', delayTime: '0 ms', status: 'Listening' },
  { tool: 'TOOL', handlerSfName: 'S7F19', id: '-', replySfName: 'S7F20_4520', delayTime: '0 ms', status: 'Listening' },
  { tool: 'CANON', handlerSfName: 'S16F16', id: '-', replySfName: 'S16F16', delayTime: '0 ms', status: 'Listening' }
]);

const searchText = ref('');
const addEngineModalVisible = ref(false);
const editingEngine = ref<any>(null);

// Methods
const openAddEngineModal = () => {
  editingEngine.value = null;
  addEngineModalVisible.value = true;
};

const handleEditEngine = (engine: any) => {
  editingEngine.value = engine;
  addEngineModalVisible.value = true;
};

const handleDeleteEngine = (engine: any) => {
  Modal.confirm({
    title: 'Delete Engine',
    content: `Are you sure you want to delete ${engine.name}?`,
    onOk: () => {
      const index = engineList.value.indexOf(engine);
      if (index > -1) {
        engineList.value.splice(index, 1);
      }
    }
  });
};

const handleViewConfig = (engine: any) => {
  Modal.info({
    title: 'Engine Configuration',
    content: `Configuration details for ${engine.name} would appear here.`,
  });
};

const handleAddEngine = (formData: any) => {
  const newName = `${formData.deviceId}. ${formData.name}`;

  if (editingEngine.value) {
    // Edit mode
    editingEngine.value.name = newName;
  } else {
    // Add mode
    const newEngine = {
      name: newName,
      active: false
    };
    engineList.value.push(newEngine);
  }
};

const selectEngine = (item: any) => {
  engineList.value.forEach(engine => engine.active = false);
  item.active = true;
};

const openEngine = (item: any) => {
  selectEngine(item);
  addLogPanel(item);
  console.log('Opening engine:', item.name);
};

const addAutoReply = () => {
  console.log('Add auto reply clicked');
};

// File Tree operations
const handleEditFile = (node: TreeNodeData) => {
  Modal.info({
    title: 'Edit File',
    content: `Edit file: ${node.title}`,
  });
};

const handleDeleteFile = (node: TreeNodeData) => {
  Modal.confirm({
    title: 'Delete File',
    content: `Are you sure you want to delete ${node.title}?`,
    onOk: () => {
      console.log('Delete file:', node.key);
      // TODO: Implement actual delete logic
    }
  });
};

const handleSendFileTo = (data: { file: TreeNodeData; engineName: string }) => {
  console.log('Send file to engine:', data.file.title, '->', data.engineName);
  // TODO: Implement actual send logic
};
</script>

<style lang="less">
/* Global styles for this page (layout specific) */
.app-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--color-bg-1);
}

.sider-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.file-tree-wrapper {
  flex: 1;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
}

.file-preview-wrapper {
  height: 200px;
  flex-shrink: 0;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.logs-wrapper {
  flex: 1;
  overflow: hidden;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-2);

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
  background-color: var(--color-bg-1);

  .log-panel-item {
    height: 100%;
    border-right: 1px solid var(--color-border);
    overflow: hidden;

    &:last-child {
      border-right: none;
    }

    &.single-panel {
      flex: 1;
      width: 100% !important;
    }
  }
}
</style>
