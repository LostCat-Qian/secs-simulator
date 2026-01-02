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
              @sendTo="handleSendFileTo" @selectFile="handlePreviewFile" @addFile="handleAddFile"
              @addRootFile="handleAddRootFile" @addRootFolder="openAddRootFolderModal" />
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

        <a-resize-box :directions="['top']" class="auto-reply-box">
          <AutoReplyPanel :data="tableData" v-model:searchText="searchText" @add="addAutoReply" @edit="editAutoReply"
            @delete="deleteAutoReply" />
        </a-resize-box>
      </a-layout-content>
    </a-layout>

    <AddEngineModal v-model:visible="addEngineModalVisible" :initial-data="editingEngine" @submit="handleAddEngine" />

    <FileEditorModal v-model:visible="fileEditorModalVisible" :file-name="editingFileName"
      :initial-content="editingFileContent" :editable-name="isCreateMode" @save="handleSaveFile" />

    <AddFolderModal v-model:visible="addRootFolderModalVisible" @submit="confirmAddRootFolder" />

    <AutoReplyModal v-model:visible="autoReplyModalVisible" :initial-data="autoReplyForm" :engines="engineList"
      @submit="handleSaveAutoReply" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Modal, TreeNodeData, Message } from '@arco-design/web-vue';
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute } from '@/api';

// Components
import EngineList from './components/EngineList.vue';
import FileTree from './components/FileTree.vue';
import FilePreview from './components/FilePreview.vue';
import LogPanel from './components/LogPanel.vue';
import AutoReplyPanel from './components/AutoReplyPanel.vue';
import AddEngineModal from './components/AddEngineModal.vue';
import FileEditorModal from './components/FileEditorModal.vue';
import AddFolderModal from './components/AddFolderModal.vue';
import AutoReplyModal from './components/AutoReplyModal.vue';

// Types
import type {
  LogPanelData,
  EngineData,
  AutoReplyFormData,
  AutoReplyItem,
  SmlTreeNode,
  LogEntry
} from './types';

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
const fileTreeData = ref<SmlTreeNode[]>([]);

// File Preview State
const filePreviewContent = ref('');

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
const tableData = ref<AutoReplyItem[]>([]);

const autoReplyModalVisible = ref(false);
const defaultAutoReplyScript = `function handler(msg, dir) {\n  return dir[0];\n}\n`;
const autoReplyForm = ref<AutoReplyFormData | null>(null);
const editingAutoReplyName = ref<string | null>(null);

// Modal State
const addEngineModalVisible = ref(false);
const editingEngine = ref<any>(null);

// File Editor Modal State
const fileEditorModalVisible = ref(false);
const editingFileName = ref('');
const editingFileContent = ref('');
const editingFilePath = ref('');
const isCreateMode = ref(false);
const creatingFolderPath = ref('');

const addRootFolderModalVisible = ref(false);

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
    okText: 'Delete',
    cancelText: 'Cancel',
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

const loadFileTree = async () => {
  if (!ipc) {
    return;
  }
  try {
    const result = await ipc.invoke(ipcApiRoute.smlFileTree, null);
    fileTreeData.value = Array.isArray(result) ? (result as SmlTreeNode[]) : [];
  } catch (error) {
    console.error('Failed to load file tree:', error);
    Message.error('Failed to load file tree');
  }
};

const handleAddFile = (node: TreeNodeData) => {
  const target = node as SmlTreeNode;
  creatingFolderPath.value = target.key || '';
  editingFileName.value = '';
  editingFilePath.value = '';
  editingFileContent.value = '';
  isCreateMode.value = true;
  fileEditorModalVisible.value = true;
};

const handleAddRootFile = () => {
  creatingFolderPath.value = '';
  editingFileName.value = '';
  editingFilePath.value = '';
  editingFileContent.value = '';
  isCreateMode.value = true;
  fileEditorModalVisible.value = true;
};

const openAddRootFolderModal = () => {
  addRootFolderModalVisible.value = true;
};

const confirmAddRootFolder = async (folderName: string) => {
  const name = folderName.trim();
  if (!name) {
    Message.error('Folder name is required');
    return;
  }
  if (/[\\/]/.test(name)) {
    Message.error('Folder name cannot contain / or \\');
    return;
  }
  const folderPath = name;

  const exists = fileTreeData.value.some((node: SmlTreeNode) => {
    const normalize = (p: string) => p.replace(/\\/g, '/');
    return normalize(node.key as string) === normalize(folderPath);
  });

  if (exists) {
    Message.error('Folder already exists');
    return;
  }

  if (!ipc) {
    Message.error('Cannot create folder');
    return;
  }

  try {
    await ipc.invoke(ipcApiRoute.smlFolderCreate, {
      folderPath
    });
    await loadFileTree();
    Message.success(`Folder "${name}" created successfully`);
    addRootFolderModalVisible.value = false;
  } catch (error) {
    console.error('Failed to create folder:', error);
    Message.error('Failed to create folder');
  }
};

const loadFileContent = async (node: TreeNodeData) => {
  const target = node as SmlTreeNode;
  if ((target.isFolder && target.isFolder === true) || !target.key) {
    return;
  }
  editingFileName.value = String(target.title || '');
  editingFilePath.value = String(target.key || '');
  let content = '';
  if (ipc) {
    try {
      const result = await ipc.invoke(ipcApiRoute.smlFileContent, {
        filePath: editingFilePath.value
      });
      content = result ? String(result) : '';
    } catch (error) {
      console.error('Failed to load file content:', error);
      Message.error('Failed to load file content');
    }
  }
  if (!content) {
    content = `// ${editingFileName.value}\n`;
  }
  editingFileContent.value = content;
  filePreviewContent.value = content;
};

const handleEditFile = async (node: TreeNodeData) => {
  isCreateMode.value = false;
  await loadFileContent(node);
  if (!editingFileContent.value) {
    return;
  }
  fileEditorModalVisible.value = true;
};

const handlePreviewFile = async (node: TreeNodeData) => {
  await loadFileContent(node);
};

const handleSaveFile = async (payload: { name: string; content: string }) => {
  if (!ipc) {
    Message.error('Cannot save file');
    return;
  }

  let name = payload.name?.trim() || editingFileName.value;
  const content = payload.content;

  if (!name) {
    Message.error('File name is required');
    return;
  }

  if (isCreateMode.value && !name.toLowerCase().endsWith('.txt')) {
    name = `${name}.txt`;
  }

  const normalizePath = (p: string | undefined | null) => {
    if (!p) return '';
    return String(p).replace(/\\/g, '/');
  };

  const targetPath = (() => {
    if (!isCreateMode.value) {
      return editingFilePath.value;
    }
    if (!creatingFolderPath.value) {
      return name;
    }
    const base = normalizePath(creatingFolderPath.value);
    return `${base}/${name}`;
  })();

  if (isCreateMode.value) {
    const exists = (() => {
      const search = (nodes: SmlTreeNode[]): boolean => {
        for (const node of nodes) {
          if (normalizePath(node.key as string) === normalizePath(targetPath)) {
            return true;
          }
          if (node.children && node.children.length > 0) {
            if (search(node.children as SmlTreeNode[])) {
              return true;
            }
          }
        }
        return false;
      };
      return search(fileTreeData.value);
    })();

    if (exists) {
      Message.error('File already exists, please rename');
      return;
    }
  }

  try {
    if (isCreateMode.value) {
      await ipc.invoke(ipcApiRoute.smlFileCreate, {
        filePath: targetPath,
        content
      });

      editingFileName.value = name;
      editingFilePath.value = targetPath || '';
      editingFileContent.value = content;
      filePreviewContent.value = content;

      await loadFileTree();
      Message.success(`File "${name}" created successfully`);
      fileEditorModalVisible.value = false;
    } else {
      if (!targetPath) {
        Message.error('Cannot save file');
        return;
      }

      await ipc.invoke(ipcApiRoute.smlFileSave, {
        filePath: targetPath,
        content
      });

      editingFileContent.value = content;
      filePreviewContent.value = content;
      Message.success(`File "${editingFileName.value}" saved successfully`);
      fileEditorModalVisible.value = false;
    }
  } catch (error) {
    console.error('Failed to save file:', error);
    Message.error('Failed to save file');
  }
};

const removeNodeFromTree = (key: string) => {
  const remove = (nodes: SmlTreeNode[]): SmlTreeNode[] =>
    nodes
      .map((node) => {
        const current = { ...node };
        if (current.children && current.children.length > 0) {
          current.children = remove(current.children);
        }
        return current;
      })
      .filter((node) => node.key !== key);

  fileTreeData.value = remove(fileTreeData.value);
};

const handleDeleteFile = (node: TreeNodeData) => {
  const target = node as SmlTreeNode;
  if (!target.key) {
    return;
  }
  
  const isFolder = target.isFolder;
  const typeText = isFolder ? 'Folder' : 'File';
  
  Modal.confirm({
    title: `Delete ${typeText}`,
    content: `Are you sure you want to delete ${typeText.toLowerCase()} "${target.title}"?`,
    okText: 'Delete',
    cancelText: 'Cancel',
    onOk: async () => {
      if (!ipc) {
        Message.error(`Cannot delete ${typeText.toLowerCase()}`);
        return;
      }
      try {
        if (isFolder) {
            await ipc.invoke(ipcApiRoute.smlFolderDelete, {
                folderPath: target.key
            });
        } else {
            await ipc.invoke(ipcApiRoute.smlFileDelete, {
                filePath: target.key
            });
        }
        
        removeNodeFromTree(target.key);
        Message.success(`${typeText} deleted`);
      } catch (error) {
        console.error(`Failed to delete ${typeText.toLowerCase()}:`, error);
        Message.error(`Failed to delete ${typeText.toLowerCase()}`);
      }
    }
  });
};

const handleSendFileTo = (payload: { file: TreeNodeData, engineName: string }) => {
  console.log(`Sending ${payload.file.title} to ${payload.engineName}`);
  Message.success(`Sent ${payload.file.title} to ${payload.engineName}`);
};

// #endregion

const loadAutoReplyScripts = async () => {
  if (!ipc) {
    return;
  }
  try {
    const result = await ipc.invoke(ipcApiRoute.listScripts, null);
    if (Array.isArray(result)) {
      tableData.value = result.map((item: any) => ({
        name: String(item.name || ''),
        tool: String(item.tool || ''),
        sf: String(item.sf || ''),
        delaySeconds: Number.isFinite(Number(item.delaySeconds)) ? Number(item.delaySeconds) : 0,
        active: Boolean(item.active)
      }));
    } else {
      tableData.value = [];
    }
  } catch (error) {
    console.error('Failed to load auto reply scripts:', error);
    Message.error('Failed to load auto reply scripts');
  }
};

onMounted(() => {
  loadFileTree();
  loadAutoReplyScripts();
});

// #region --- Methods: Auto Reply ---

const addAutoReply = () => {
  autoReplyForm.value = {
    tool: engineList.value[0]?.name || '',
    handlerSf: '',
    active: true,
    delaySeconds: 0,
    script: defaultAutoReplyScript
  };
  editingAutoReplyName.value = null;
  autoReplyModalVisible.value = true;
};

const editAutoReply = async (item: AutoReplyItem) => {
  if (!ipc) {
    Message.error('Cannot edit auto reply');
    return;
  }

  try {
    const result: any = await ipc.invoke(ipcApiRoute.getScript, { name: item.name });

    autoReplyForm.value = {
      tool: String(result.tool || item.tool || ''),
      handlerSf: String(result.sf || item.sf || ''),
      active: Boolean(typeof result.active === 'boolean' ? result.active : item.active),
      delaySeconds: Number.isFinite(Number(result.delaySeconds))
        ? Number(result.delaySeconds)
        : item.delaySeconds,
      script: String(result.code || '')
    };

    editingAutoReplyName.value = item.name;
    autoReplyModalVisible.value = true;
  } catch (error) {
    console.error('Failed to load auto reply script detail:', error);
    Message.error('Failed to load auto reply script detail');
  }
};

const deleteAutoReply = (item: AutoReplyItem) => {
  Modal.confirm({
    title: 'Delete Auto Reply Script',
    content: `Are you sure you want to delete script for ${item.tool} / ${item.sf}?`,
    okText: 'Delete',
    cancelText: 'Cancel',
    async onOk() {
      if (!ipc) {
        Message.error('Cannot delete auto reply');
        return;
      }
      try {
        await ipc.invoke(ipcApiRoute.deleteScript, { name: item.name });
        await loadAutoReplyScripts();
        Message.success('Auto reply script deleted');
      } catch (error) {
        console.error('Failed to delete auto reply script:', error);
        Message.error('Failed to delete auto reply script');
      }
    }
  });
};

const handleSaveAutoReply = async (form: AutoReplyFormData) => {
  if (!form.tool) {
    Message.error('Tool is required');
    return;
  }
  if (!form.handlerSf) {
    Message.error('Handle SF is required');
    return;
  }
  if (!form.script.trim()) {
    Message.error('Script is required');
    return;
  }

  if (!ipc) {
    Message.error('Cannot save auto reply');
    return;
  }

  try {
    if (editingAutoReplyName.value) {
      await ipc.invoke(ipcApiRoute.updateScript, {
        originalName: editingAutoReplyName.value,
        tool: form.tool,
        handlerSf: form.handlerSf,
        active: form.active,
        delaySeconds: form.delaySeconds,
        code: form.script
      });
      Message.success('Auto reply script updated');
    } else {
      await ipc.invoke(ipcApiRoute.addScript, {
        tool: form.tool,
        handlerSf: form.handlerSf,
        active: form.active,
        delaySeconds: form.delaySeconds,
        code: form.script
      });
      Message.success('Auto reply script added');
    }

    await loadAutoReplyScripts();

    editingAutoReplyName.value = null;
    autoReplyModalVisible.value = false;
  } catch (error) {
    console.error('Failed to save auto reply script:', error);
    Message.error('Failed to save auto reply script');
  }
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
