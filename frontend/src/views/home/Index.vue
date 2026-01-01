<template>
  <div class="layout-container">
    <a-layout style="height: 100%;">
      <a-layout>
        <!-- 左侧栏 -->
        <a-layout-sider :resize-directions="['right']" class="left-sider" :width="320">
          <!-- 上方：Engines区域 - 使用ResizeBox -->
          <a-resize-box :directions="['bottom']" class="engines-resize-box" :style="{ height: enginesHeight }"
            @moving="handleEnginesResize">
            <div class="engines-section">
              <div class="section-header">
                <div class="section-title">Engines</div>
                <a-button type="primary" size="small" @click="openAddEngineModal">
                  <template #icon>
                    <icon-plus />
                  </template>
                  Add
                </a-button>
              </div>
              <div class="engine-list">
                <div v-for="(item, index) in engineList" :key="index" :class="['engine-item', { active: item.active }]">
                  <div class="engine-left" @click="selectEngine(item)">
                    <div class="engine-icon">
                      <icon-folder />
                    </div>
                    <div class="engine-info">
                      <div class="engine-name">{{ item.name }}</div>
                      <div v-if="item.active" class="engine-status">
                        <span class="status-dot"></span>
                        <span class="status-text">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                  <a-button type="primary" size="mini" class="engine-open-btn" @click.stop="openEngine(item)">
                    Open
                  </a-button>
                </div>
              </div>
            </div>
          </a-resize-box>

          <!-- 中间：文件树区域 -->
          <div class="file-tree-section">
            <div class="section-header">
              <div class="section-title">File Tree</div>
            </div>
            <div class="file-tree">
              <a-tree :data="fileTreeData" :default-expand-all="true" :show-line="true">
                <template #title="nodeData">
                  <div class="tree-node">
                    <icon-folder v-if="nodeData.isFolder" />
                    <icon-file v-else />
                    <span>{{ nodeData.title }}</span>
                  </div>
                </template>
              </a-tree>
            </div>
          </div>

          <!-- 下方：文件内容预览区域 -->
          <div class="file-preview-section">
            <div class="section-header">
              <div class="section-title">File Preview</div>
            </div>
            <div class="file-preview">
              <pre class="preview-content">{{ filePreviewContent }}</pre>
            </div>
          </div>
        </a-layout-sider>

        <!-- 右侧主内容区 -->
        <a-layout-content class="main-content">
          <!-- 上方：实时日志区域 -->
          <div class="log-section">
            <div class="log-header">
              <div class="log-title">Real-time Logs</div>
              <div class="log-actions">
                <a-button size="small" type="outline">
                  <template #icon>
                    <icon-refresh />
                  </template>
                  Clear
                </a-button>
              </div>
            </div>
            <div class="log-content">
              <div v-for="(log, index) in realTimeLogs" :key="index"
                :class="['log-item', `log-${log.level.toLowerCase()}`]">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-level">[{{ log.level }}]</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>

          <!-- 下方：Auto Reply配置区域 -->
          <a-resize-box :directions="['top']" class="auto-reply-resize-box" :style="{ height: autoReplyHeight }"
            @moving="handleAutoReplyResize">
            <div class="auto-reply-section">
              <!-- 顶部操作栏 -->
              <div class="content-header">
                <div class="header-title">Auto Reply Setting</div>
                <div class="header-actions">
                  <a-input-search v-model="searchText" placeholder="Search..." class="search-input" size="small" />
                  <a-button type="primary" class="add-btn">
                    <template #icon>
                      <icon-plus />
                    </template>
                    Add
                  </a-button>
                </div>
              </div>

              <!-- 表格区域 -->
              <div class="table-container">
                <a-table :data="tableData" :pagination="false" :bordered="false" :stripe="true" class="auto-reply-table"
                  :row-class="getRowClass">
                  <template #columns>
                    <a-table-column title="Tool" data-index="tool" :width="100" />
                    <a-table-column title="Handler SF Name" data-index="handlerSfName" :width="150" />
                    <a-table-column title="ID (201, 0~1)" data-index="id" :width="150" />
                    <a-table-column title="Reply SF Name" data-index="replySfName" :width="150" />
                    <a-table-column title="Delay Time" data-index="delayTime" :width="120" />
                    <a-table-column title="Status" data-index="status" :width="120">
                      <template #cell="{ record }">
                        <span :class="['status-tag', `status-${record.status.toLowerCase()}`]">
                          {{ record.status }}
                        </span>
                      </template>
                    </a-table-column>
                  </template>
                </a-table>
              </div>
            </div>
          </a-resize-box>
        </a-layout-content>
      </a-layout>
    </a-layout>

    <!-- Add Engine Modal -->
    <a-modal v-model:visible="addEngineModalVisible" title="Engine Properties" :width="850" :footer="false"
      :mask-closable="false" @cancel="closeAddEngineModal">
      <a-form :model="engineForm" layout="vertical" class="engine-form">
        <!-- Engine Properties -->
        <a-divider orientation="left">Engine Properties</a-divider>
        <a-row :gutter="20">
          <a-col :span="8">
            <a-form-item label="Name">
              <a-input v-model="engineForm.name" placeholder="TOOL" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Device ID">
              <a-input v-model="engineForm.deviceId" placeholder="10" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Type">
              <a-select v-model="engineForm.type" placeholder="HSMS">
                <a-option value="HSMS">HSMS</a-option>
                <a-option value="SECS-I">SECS-I</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Communication Configuration -->
        <a-divider orientation="left">Communication Configuration</a-divider>
        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item label="Serial Port">
              <a-select v-model="engineForm.serialPort" placeholder="COM1">
                <a-option value="COM1">COM1</a-option>
                <a-option value="COM2">COM2</a-option>
                <a-option value="COM3">COM3</a-option>
                <a-option value="COM4">COM4</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Baud">
              <a-select v-model="engineForm.baud" placeholder="9600">
                <a-option value="9600">9600</a-option>
                <a-option value="19200">19200</a-option>
                <a-option value="38400">38400</a-option>
                <a-option value="57600">57600</a-option>
                <a-option value="115200">115200</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item label="Retry">
              <a-input-number v-model="engineForm.retry" :min="0" :max="10" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Master">
              <a-select v-model="engineForm.master" placeholder="Master">
                <a-option value="Master">Master</a-option>
                <a-option value="Slave">Slave</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item label="TCP Port">
              <a-input v-model="engineForm.tcpPort" placeholder="5001" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Simulate">
              <a-select v-model="engineForm.simulate" placeholder="Equipment">
                <a-option value="Equipment">Equipment</a-option>
                <a-option value="Host">Host</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item label="Remote IP">
              <a-input v-model="engineForm.remoteIp" placeholder="127.0.0.1" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="Local IP">
              <a-input v-model="engineForm.localIp" placeholder="127.0.0.1" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="20">
          <a-col :span="12">
            <a-form-item label="Max Length">
              <a-input v-model="engineForm.maxLength" placeholder="9437184" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- T Parameters -->
        <a-divider orientation="left">Timeout Parameters (T0-T8)</a-divider>
        <div class="t-parameters-grid">
          <div v-for="i in 9" :key="i" class="t-parameter-item">
            <a-form-item :label="`T${i - 1}`">
              <a-input v-model="engineForm[`t${i - 1}`]" :placeholder="getDefaultTValue(i - 1)" />
            </a-form-item>
          </div>
        </div>

        <!-- Advance Setting -->
        <a-divider orientation="left">Advance setting</a-divider>
        <a-row :gutter="20">
          <a-col :span="8">
            <a-form-item label="Data Bit">
              <a-select v-model="engineForm.dataBit" placeholder="8">
                <a-option value="5">5</a-option>
                <a-option value="6">6</a-option>
                <a-option value="7">7</a-option>
                <a-option value="8">8</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Stop Bit">
              <a-select v-model="engineForm.stopBit" placeholder="1">
                <a-option value="1">1</a-option>
                <a-option value="1.5">1.5</a-option>
                <a-option value="2">2</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Parity">
              <a-select v-model="engineForm.parity" placeholder="None">
                <a-option value="None">None</a-option>
                <a-option value="Odd">Odd</a-option>
                <a-option value="Even">Even</a-option>
                <a-option value="Mark">Mark</a-option>
                <a-option value="Space">Space</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Footer Buttons -->
        <div class="modal-footer">
          <a-button @click="closeAddEngineModal">Cancel</a-button>
          <a-button type="primary" @click="handleAddEngine">OK</a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<style>
/* 全局样式重置，确保页面不会超出视口 */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 全局滚动条样式优化 */
*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb {
  background: #C9CDD4;
  border-radius: 3px;

  &:hover {
    background: #86909C;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IconFolder,
  IconFile,
  IconPlus,
  IconRefresh
} from '@arco-design/web-vue/es/icon'

// 左侧导航数据
const enginesHeight = ref('200px')
const autoReplyHeight = ref('300px')
const addEngineModalVisible = ref(false)
const engineList = ref([
  {
    name: '1. TOOL_CONTROL_LINK',
    active: true
  },
  {
    name: '01_S6F11_CassetteAr',
    active: false
  },
  {
    name: '02_S6F11_CassetteAr',
    active: false
  },
  {
    name: '03_S6F11_Clam',
    active: false
  },
  {
    name: 'S1F18_CarrierActio',
    active: false
  }
])

// Engine表单数据
const engineForm = ref({
  name: 'TOOL',
  deviceId: '10',
  type: 'HSMS',
  serialPort: 'COM1',
  baud: '9600',
  retry: 3,
  master: 'Master',
  tcpPort: '5001',
  simulate: 'Equipment',
  remoteIp: '127.0.0.1',
  localIp: '127.0.0.1',
  maxLength: '9437184',
  t0: '500',
  t1: '10',
  t2: '45',
  t3: '180',
  t4: '120',
  t5: '10',
  t6: '10',
  t7: '10',
  t8: '10',
  dataBit: '8',
  stopBit: '1',
  parity: 'None'
})

// 处理Engines区域resize
const handleEnginesResize = (size: any) => {
  enginesHeight.value = `${size.height}px`
}

// 处理Auto Reply区域resize
const handleAutoReplyResize = (size: any) => {
  autoReplyHeight.value = `${size.height}px`
}

// 打开添加Engine模态框
const openAddEngineModal = () => {
  addEngineModalVisible.value = true
}

// 关闭添加Engine模态框
const closeAddEngineModal = () => {
  addEngineModalVisible.value = false
  // 重置表单
  engineForm.value = {
    name: 'TOOL',
    deviceId: '10',
    type: 'HSMS',
    serialPort: 'COM1',
    baud: '9600',
    retry: 3,
    master: 'Master',
    tcpPort: '5001',
    simulate: 'Equipment',
    remoteIp: '127.0.0.1',
    localIp: '127.0.0.1',
    maxLength: '9437184',
    t0: '500',
    t1: '10',
    t2: '45',
    t3: '180',
    t4: '120',
    t5: '10',
    t6: '10',
    t7: '10',
    t8: '10',
    dataBit: '8',
    stopBit: '1',
    parity: 'None'
  }
}

// 处理添加Engine
const handleAddEngine = () => {
  // 添加新的engine到列表
  const newEngine = {
    name: `${engineForm.value.deviceId}. ${engineForm.value.name}`,
    active: false
  }
  engineList.value.push(newEngine)

  // 关闭模态框
  closeAddEngineModal()

  // 显示成功提示
  // 可以在这里添加通知提示
}

// 获取T参数默认值
const getDefaultTValue = (index: number) => {
  const defaultValues = ['500', '10', '45', '180', '120', '10', '10', '10', '10']
  return defaultValues[index] || ''
}

// 文件树数据
const fileTreeData = ref([
  {
    title: 'configs',
    key: 'configs',
    isFolder: true,
    children: [
      {
        title: 'engine.config',
        key: 'engine-config',
        isFolder: false
      },
      {
        title: 'messages.config',
        key: 'messages-config',
        isFolder: false
      }
    ]
  },
  {
    title: 'handlers',
    key: 'handlers',
    isFolder: true,
    children: [
      {
        title: 'S1F13.js',
        key: 's1f13',
        isFolder: false
      },
      {
        title: 'S1F14.js',
        key: 's1f14',
        isFolder: false
      },
      {
        title: 'S6F11.js',
        key: 's6f11',
        isFolder: false
      }
    ]
  },
  {
    title: 'logs',
    key: 'logs',
    isFolder: true,
    children: [
      {
        title: '2025-12-31.log',
        key: 'log-2025-12-31',
        isFolder: false
      }
    ]
  }
])

// 文件预览内容
const filePreviewContent = ref(`// Engine Configuration
{
  "name": "TOOL_CONTROL_LINK",
  "deviceId": "EQ_CVD_001",
  "ip": "192.168.1.105",
  "port": 5000,
  "timeout": 30,
  "retryCount": 3
}`)

// 实时日志数据
const realTimeLogs = ref([
  {
    time: '14:30:05',
    level: 'INFO',
    message: 'Connection established with EQ_CVD_001'
  },
  {
    time: '14:30:06',
    level: 'INFO',
    message: 'Received S1F13 message from equipment'
  },
  {
    time: '14:30:07',
    level: 'DEBUG',
    message: 'Processing S1F14 reply message'
  },
  {
    time: '14:30:08',
    level: 'WARN',
    message: 'T3 timeout detected, retrying...'
  },
  {
    time: '14:30:09',
    level: 'INFO',
    message: 'S1F14 message sent successfully'
  },
  {
    time: '14:30:10',
    level: 'INFO',
    message: 'Waiting for next message...'
  },
  {
    time: '14:30:11',
    level: 'ERROR',
    message: 'Connection lost, attempting to reconnect...'
  },
  {
    time: '14:30:12',
    level: 'INFO',
    message: 'Reconnection successful'
  }
])

// 表格数据
const searchText = ref('')
const tableData = ref([
  {
    tool: 'HIRATA',
    handlerSfName: 'SIF3',
    id: '#0^0',
    replySfName: 'SIF4-105',
    delayTime: '0 ms',
    status: 'Active'
  },
  {
    tool: 'CANON',
    handlerSfName: 'SIF3',
    id: '122001#0',
    replySfName: 'SIF4_Reticile',
    delayTime: '0 ms',
    status: 'Standby'
  },
  {
    tool: 'CANON',
    handlerSfName: 'S7F19',
    id: '-',
    replySfName: 'S7F20_CANON',
    delayTime: '10 ms',
    status: 'Standby'
  },
  {
    tool: 'HIRATA',
    handlerSfName: 'S16F15',
    id: '-',
    replySfName: 'S16F16',
    delayTime: '0 ms',
    status: 'Listening'
  },
  {
    tool: 'TOOL',
    handlerSfName: 'S7F19',
    id: '-',
    replySfName: 'S7F20_4520',
    delayTime: '0 ms',
    status: 'Listening'
  },
  {
    tool: 'CANON',
    handlerSfName: 'S16F16',
    id: '-',
    replySfName: 'S16F16',
    delayTime: '0 ms',
    status: 'Listening'
  }
])

// 选择引擎
const selectEngine = (item: any) => {
  engineList.value.forEach((engine) => {
    engine.active = false
  })
  item.active = true
}

// 打开引擎
const openEngine = (item: any) => {
  // 先选中该引擎
  selectEngine(item)
  // 这里可以添加打开引擎的具体逻辑
  console.log('Opening engine:', item.name)
}

// 获取行样式
const getRowClass = (_record: any, rowIndex: number) => {
  return rowIndex === 0 ? 'highlight-row' : ''
}
</script>

<style scoped lang="less">
.layout-container {
  width: 100vw;
  height: 100vh;
  background-color: #FAFAFA;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.layout-container :deep(.arco-layout) {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.layout-container :deep(.arco-layout-has-sider) {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

// 左侧栏样式
.left-sider {
  background-color: #FFFFFF;
  border-right: 1px solid #E5E5E5;
  min-width: 320px !important;
  max-width: 450px !important;
  height: 100%;
  overflow: hidden;

  :deep(.arco-layout-sider-children) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
}

// 区域通用样式
.section-header {
  padding: 12px 16px;
  border-bottom: 1px solid #E5E5E5;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1D2129;
  }

  .arco-btn {
    background-color: #5C40FF;
    border-color: #5C40FF;
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;

    &:hover {
      background-color: #4B34E8;
      border-color: #4B34E8;
    }
  }
}

// Engines区域 - 使用ResizeBox
.engines-resize-box {
  flex: 0 0 auto;
  border-bottom: 1px solid #E5E5E5;
  overflow: hidden;

  :deep(.arco-resizebox-trigger) {
    background-color: #E5E5E5;
    height: 4px;

    &:hover {
      background-color: #5C40FF;
    }
  }
}

.engines-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .engine-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #F7F8FA;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #C9CDD4;
      border-radius: 3px;

      &:hover {
        background: #86909C;
      }
    }
  }
}

.engine-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #F2F3F5;
  }

  &.active {
    background-color: #E8F3FF;
  }

  .engine-left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .engine-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F7F8FA;
    border-radius: 6px;
    margin-right: 10px;
    color: #4E5969;
    font-size: 16px;
    flex-shrink: 0;
  }

  .engine-info {
    flex: 1;
    min-width: 0;

    .engine-name {
      font-size: 13px;
      color: #1D2129;
      margin-bottom: 4px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .engine-status {
      display: flex;
      align-items: center;

      .status-dot {
        width: 6px;
        height: 6px;
        background-color: #00C853;
        border-radius: 50%;
        margin-right: 6px;
      }

      .status-text {
        font-size: 11px;
        color: #00C853;
        font-weight: 600;
      }
    }
  }

  .engine-open-btn {
    margin-left: 8px;
    flex-shrink: 0;
    background-color: #5C40FF;
    border-color: #5C40FF;
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    height: 28px;

    &:hover {
      background-color: #4B34E8;
      border-color: #4B34E8;
    }

    &:active {
      background-color: #3A28D7;
      border-color: #3A28D7;
    }
  }
}

// 文件树区域
.file-tree-section {
  flex: 1;
  border-bottom: 1px solid #E5E5E5;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  .file-tree {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 8px 12px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #F7F8FA;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #C9CDD4;
      border-radius: 3px;

      &:hover {
        background: #86909C;
      }
    }

    :deep(.arco-tree-node-title) {
      padding: 4px 8px;
      border-radius: 4px;

      &:hover {
        background-color: #F2F3F5;
      }
    }

    .tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #4E5969;

      .arco-icon {
        font-size: 16px;
      }
    }
  }
}

// 文件预览区域
.file-preview-section {
  flex: 0 0 auto;
  height: 180px;
  display: flex;
  flex-direction: column;
  border-top: 1px solid #E5E5E5;
  overflow: hidden;

  .file-preview {
    flex: 1;
    overflow: auto;
    overflow-x: hidden;
    padding: 12px;
    background-color: #F7F8FA;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #F7F8FA;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #C9CDD4;
      border-radius: 3px;

      &:hover {
        background: #86909C;
      }
    }

    .preview-content {
      margin: 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      color: #1D2129;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

// 主内容区样式
.main-content {
  display: flex;
  flex-direction: column;
  background-color: #FAFAFA;
  height: 100%;
  overflow: hidden;

  :deep(.arco-layout-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
}

// 实时日志区域
.log-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E5E5;
  min-height: 0;
  overflow: hidden;

  .log-header {
    padding: 12px 20px;
    border-bottom: 1px solid #E5E5E5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .log-title {
      font-size: 15px;
      font-weight: 600;
      color: #1D2129;
    }
  }

  .log-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px 20px;
    background-color: #121212;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #1D2129;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #4E5969;
      border-radius: 3px;

      &:hover {
        background: #86909C;
      }
    }

    .log-item {
      display: flex;
      align-items: flex-start;
      padding: 6px 0;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      &:last-child {
        border-bottom: none;
      }

      .log-time {
        color: #86909C;
        margin-right: 12px;
        min-width: 80px;
      }

      .log-level {
        margin-right: 12px;
        min-width: 60px;
        font-weight: 600;
      }

      .log-message {
        color: #E5E6EB;
        flex: 1;
      }

      &.log-info .log-level {
        color: #3491FA;
      }

      &.log-debug .log-level {
        color: #99A3B4;
      }

      &.log-warn .log-level {
        color: #FF7D00;
      }

      &.log-error .log-level {
        color: #F53F3F;
      }
    }
  }
}

// Auto Reply配置区域 - 使用ResizeBox
.auto-reply-resize-box {
  flex: 0 0 auto;
  border-top: 1px solid #E5E5E5;
  overflow: hidden;
  min-height: 200px;
  max-height: calc(100vh - 300px);

  :deep(.arco-resizebox-trigger) {
    background-color: #E5E5E5;
    height: 4px;

    &:hover {
      background-color: #5C40FF;
    }
  }
}

.auto-reply-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  overflow: hidden;

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid #E5E5E5;
    flex-shrink: 0;

    .header-title {
      font-size: 15px;
      font-weight: 600;
      color: #1D2129;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;

      .search-input {
        width: 200px;

        :deep(.arco-input) {
          border-radius: 6px;
          font-size: 13px;
        }
      }

      .add-btn {
        background-color: #5C40FF;
        border-color: #5C40FF;
        border-radius: 6px;
        padding: 5px 14px;
        font-weight: 600;
        font-size: 13px;

        &:hover {
          background-color: #4B34E8;
          border-color: #4B34E8;
        }
      }
    }
  }

  .table-container {
    flex: 1;
    padding: 12px 20px;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #F7F8FA;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #C9CDD4;
      border-radius: 3px;

      &:hover {
        background: #86909C;
      }
    }

    .auto-reply-table {
      background-color: #FFFFFF;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      :deep(.arco-table) {
        border-radius: 6px;
        overflow: hidden;
      }

      :deep(.arco-table-th) {
        background-color: #F7F8FA;
        font-weight: 600;
        color: #1D2129;
        font-size: 13px;
        padding: 10px 12px;
        border-bottom: 1px solid #E5E5E5;
      }

      :deep(.arco-table-td) {
        padding: 10px 12px;
        font-size: 13px;
        color: #4E5969;
        border-bottom: 1px solid #E5E5E5;
      }

      :deep(.arco-table-tr) {
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #F2F3F5;
        }
      }

      :deep(.arco-table-tr.arco-table-tr-striped) {
        background-color: #FAFBFC;
      }

      // 高亮行样式
      :deep(.highlight-row) {
        background-color: #5C40FF !important;

        .arco-table-td {
          color: #FFFFFF;
        }

        &:hover {
          background-color: #4B34E8 !important;
        }
      }

      // 状态标签样式
      .status-tag {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;

        &.status-active {
          color: #00C853;
          background-color: rgba(0, 200, 83, 0.1);
        }

        &.status-standby {
          color: #86909C;
          background-color: rgba(134, 144, 156, 0.1);
        }

        &.status-listening {
          color: #00E676;
          background-color: rgba(0, 230, 118, 0.1);
        }
      }
    }
  }
}

// 响应式调整
@media (max-width: 1400px) {
  .left-sider {
    min-width: 280px !important;
  }

  .content-header {
    .header-actions {
      .search-input {
        width: 160px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .t-parameters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .t-parameters-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .engine-form {
    padding: 16px;
  }
}

// Add Engine Modal 样式
.engine-form {
  background-color: #FFFFFF;
  padding: 24px;

  :deep(.arco-divider-text) {
    background-color: #FFFFFF;
    font-weight: 600;
    color: #1D2129;
    font-size: 15px;
    padding: 0 12px;
  }

  :deep(.arco-divider-horizontal) {
    border-color: #E5E6EB;
    margin: 20px 0;
  }

  :deep(.arco-form-item) {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.arco-form-item-label-col > label) {
    color: #4E5969;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
  }

  :deep(.arco-input),
  :deep(.arco-select-view) {
    height: 36px;
    border: 1.5px solid #E5E6EB;
    border-radius: 8px;
    font-size: 14px;
    background-color: #F7F8FA;
    color: #1D2129;
    transition: all 0.2s ease;

    &:hover {
      border-color: #C9CDD4;
      background-color: #FFFFFF;
    }

    &:focus-within,
    &.arco-select-view-focus {
      border-color: #5C40FF;
      background-color: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(92, 64, 255, 0.1);
    }
  }

  :deep(.arco-input::placeholder) {
    color: #86909C;
  }

  :deep(.arco-input-number) {
    width: 100%;

    .arco-input {
      height: 36px;
      border: 1.5px solid #E5E6EB;
      border-radius: 8px;
      font-size: 14px;
      background-color: #F7F8FA;
      color: #1D2129;
      transition: all 0.2s ease;

      &:hover {
        border-color: #C9CDD4;
        background-color: #FFFFFF;
      }

      &:focus-within {
        border-color: #5C40FF;
        background-color: #FFFFFF;
        box-shadow: 0 0 0 3px rgba(92, 64, 255, 0.1);
      }
    }

    .arco-input-number-step-button {
      border-left: 1px solid #E5E6EB;
      color: #86909C;
      transition: all 0.2s ease;

      &:hover {
        background-color: #F2F3F5;
        color: #5C40FF;
      }

      &:active {
        background-color: #E8F3FF;
      }
    }
  }

  :deep(.arco-select-view-value) {
    color: #1D2129;
  }

  :deep(.arco-select-view-suffix) {
    color: #86909C;
  }

  :deep(.arco-select-view-single) {
    padding: 0 12px;
  }

  // T参数网格布局优化
  .arco-col {
    margin-bottom: 0;
  }
}

// T参数网格样式
.t-parameters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .t-parameter-item {
    :deep(.arco-form-item) {
      margin-bottom: 0;
    }

    :deep(.arco-form-item-label-col > label) {
      font-size: 13px;
      color: #86909C;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid #E5E6EB;

  .arco-btn {
    height: 40px;
    padding: 0 28px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    border: 1.5px solid #E5E6EB;
    background-color: #FFFFFF;
    color: #4E5969;
    transition: all 0.2s ease;

    &:hover {
      border-color: #C9CDD4;
      background-color: #F7F8FA;
      color: #1D2129;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    &:active {
      transform: translateY(0);
      box-shadow: none;
    }

    &.arco-btn-primary {
      background-color: #5C40FF;
      border-color: #5C40FF;
      color: #FFFFFF;

      &:hover {
        background-color: #4B34E8;
        border-color: #4B34E8;
        box-shadow: 0 4px 12px rgba(92, 64, 255, 0.3);
      }

      &:active {
        background-color: #3A28D7;
        border-color: #3A28D7;
      }
    }
  }
}

// Modal 自定义样式
:deep(.arco-modal-header) {
  border-bottom: 1px solid #E5E6EB;
  padding: 20px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .arco-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #FFFFFF;
    letter-spacing: 0.3px;
  }
}

:deep(.arco-modal-body) {
  padding: 0;
  background-color: #FFFFFF;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #F7F8FA;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #C9CDD4;
    border-radius: 3px;

    &:hover {
      background: #86909C;
    }
  }
}

:deep(.arco-modal-close-icon) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
    transform: rotate(90deg);
  }
}

:deep(.arco-modal) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
}

:deep(.arco-modal-mask) {
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
</style>