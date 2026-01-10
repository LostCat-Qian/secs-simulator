# AGENTS.md - SECS Simulator 开发指南

## 概述

本文档为在 SECS Simulator 项目上工作的 AI 编程代理提供必要信息。SECS Simulator 是一个基于 Electron 的桌面应用程序，用于 SECS/GEM 协议测试和设备模拟。

## 项目架构

- **前端**: Vue 3 + TypeScript + Arco Design Vue + Vite
- **后端**: Node.js + Electron + electron-egg 框架
- **通信**: secs4js 库用于 SECS/GEM 协议实现
- **架构**: 使用 Vue composables 的服务/控制器模式

## 构建、检查和测试命令

### 前端开发
```bash
# 启动前端开发服务器 (端口 8080)
npm run dev-frontend
# 或
cd frontend && npm run dev

# 生产环境构建前端
npm run build-frontend
# 或
cd frontend && npm run build

# 类型检查
cd frontend && npm run type-check
```

### Electron 开发
```bash
# 启动 electron 开发服务器
npm run dev-electron

# 构建 electron 主进程
npm run build-electron
```

### 完整应用程序
```bash
# 开发模式 (前端和 electron 同时运行)
npm run dev

# 生产环境构建 (前端 + electron + 加密)
npm run build

# 启动生产应用程序
npm run start
```

### 平台特定构建
```bash
# Windows 可执行文件
npm run build-w

# Windows 安装程序
npm run build-we

# macOS (Intel)
npm run build-m

# macOS (Apple Silicon)
npm run build-m-arm64

# Linux
npm run build-l
```

### 测试
```bash
# 未配置专用测试运行器
# 手动测试: 运行应用程序并验证功能
```

### SQLite 重建 (用于 better-sqlite3)
```bash
npm run re-sqlite
```

## 代码风格指南

### TypeScript 配置
- **目标**: ES2020
- **模块**: ESNext，使用 bundler 解析
- **严格模式**: 启用 (`strict: true`)
- **未使用变量**: 报错 (`noUnusedLocals: true`, `noUnusedParameters: true`)
- **Vue 集成**: JSX preserve 模式
- **路径别名**: `@/*` 映射到 `./src/*`

### 导入/导出约定
```typescript
// 优先使用 Vue 生态系统的命名导入
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

// 按类型分组导入，使用空行分隔
import type { EngineData } from '../types'
import { useEngine } from './useEngine'

// 本地模块使用相对导入
import { ipc } from '@/utils/ipcRenderer'
import { ipcApiRoute } from '@/api'
```

### 命名约定

#### 变量和函数
- **camelCase**: `engineList`, `loadEngineConfigs()`, `buildEngineConfigFromForm()`
- **布尔前缀**: `isRunning`, `hasReply`, `canDelete`
- **事件处理器**: `handleMenuSelect()`, `onEngineStart()`

#### 组件和文件
- **PascalCase**: `EngineList.vue`, `AutoReplyModal.vue`
- **kebab-case**: 文件名与组件名匹配
- **组合函数**: `useEngine()`, `useLogPanels()`, `useAutoReply()`

#### 类型和接口
- **PascalCase**: `EngineData`, `LogEntry`, `AutoReplyFormData`
- **后缀约定**: `Data` 用于 DTO, `Item` 用于列表项

### Vue 组件模式

#### 使用 TypeScript 的 Script Setup
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EngineData } from '../types'

// 具有正确类型的 Props
defineProps<{
  engines: EngineData[]
  loading?: boolean
}>()

// 具有类型化事件的 Emits
const emit = defineEmits<{
  (e: 'add'): void
  (e: 'select', engine: EngineData): void
  (e: 'delete', engine: EngineData): void
}>()

// 响应式状态
const selectedEngine = ref<EngineData | null>(null)
</script>
```

#### 模板结构
```vue
<template>
  <div class="engine-section">
    <!-- 清晰的区域头部 -->
    <div class="header">
      <span class="title">Engines</span>
      <a-button type="primary" size="mini" @click="$emit('add')">
        <template #icon><icon-plus /></template>
        Add
      </a-button>
    </div>

    <!-- 使用 v-for 的逻辑分组 -->
    <div class="list-container">
      <div
        v-for="(item, index) in engines"
        :key="index"
        :class="[
          'engine-item',
          {
            active: item.status === 'running',
            waiting: item.status === 'connecting'
          }
        ]"
        @click="$emit('select', item)"
      >
        <!-- 组件内容 -->
      </div>
    </div>
  </div>
</template>
```

### Electron 后端模式

#### 服务类
```javascript
'use strict'

const path = require('path')
const fs = require('fs').promises
const { logger } = require('ee-core/log')

class EngineService {
  // 公共方法的 JSDoc 注释
  /**
   * 列出可用串口
   * @returns {Promise<Array>} 端口对象数组
   */
  async listSerialPorts() {
    try {
      logger.info('🔍 [listSerialPorts] 正在列出可用串口')
      // 实现
    } catch (error) {
      logger.error('❌ [listSerialPorts] 列出串口失败:', error)
      throw new Error(`获取串口列表失败: ${error.message}`)
    }
  }
}

module.exports = {
  EngineService,
  engineService: new EngineService()
}
```

#### 错误处理
```javascript
// 异步操作使用 try-catch
try {
  const result = await ipc.invoke(ipcApiRoute.getEngineConfig, null)
  // 处理结果
} catch (error) {
  console.error('加载引擎配置失败:', error)
  Message.error('加载引擎配置失败')
}

// 处理前验证输入
if (!name || !filePath) {
  logger.error('❌ [sendMessageFromFile] 名称或文件路径为空')
  throw new Error('发送消息需要引擎名称和文件路径')
}
```

### 日志标准
- **Info**: 正常操作，成功动作
- **Debug**: 详细的故障排除信息
- **Warn**: 不影响执行的非关键问题
- **Error**: 需要注意的故障

```javascript
logger.info(`✅ [getConfig] 成功加载 ${configs.length} 个引擎配置`)
logger.error('❌ [start] 启动引擎失败:', error)
```

### 文件组织

#### 前端结构
```
frontend/src/
├── api/              # IPC 通信
├── components/       # 共享组件
├── router/           # Vue Router 配置
├── utils/            # 工具函数
├── views/            # 页面组件
│   └── home/
│       ├── components/    # 页面特定组件
│       ├── composables/   # Vue composables
│       └── types.ts       # TypeScript 接口
├── App.vue
├── main.ts
└── vite-env.d.ts
```

#### Electron 结构
```
public/electron/
├── controller/       # IPC 处理程序
├── service/          # 业务逻辑
├── config/           # 配置文件
├── preload/          # 预加载脚本
└── main.js           # Electron 主进程
```

### CSS/样式指南

#### Arco Design 集成
- 主要使用 Arco Design Vue 组件
- 通过 vite.config.ts 中的 CSS 变量覆盖默认样式
- 使用启用 JavaScript 的 Less 预处理器

#### 类命名
```vue
<style scoped>
.engine-section {
  /* 区域容器 */
}

.engine-item {
  /* 单个项目 */
  &.active {
    /* 活动状态修饰符 */
  }
}

.status-dot {
  /* 小状态指示器 */
  &.active {
    /* 活动状态样式 */
  }
}
</style>
```

### 配置文件

#### 引擎配置 (JSON)
```json
{
  "name": "HOST",
  "type": "HSMS",
  "ip": "127.0.0.1",
  "port": 5000,
  "deviceId": 10,
  "simulate": "Host",
  "timeoutT1": 10,
  "timeoutT2": 45,
  "timeoutT3": 180
}
```

#### 自动回复脚本 (JavaScript)
```javascript
/**
 * 自动回复处理器
 * @param {object} comingMsg - 来自设备的消息
 * @param {string[]} filePaths - 可用的 SML 文件路径
 * @returns {string} 用于回复的 SML 文件路径
 */
async function handler(comingMsg, filePaths) {
  // 实现
}
```

### SECS/GEM 协议指南

#### SML 文件格式
```
S1F1 W
<L [2]
  <A [6] "MDLN-A">
  <A [13] "SOFTREV-0.0.1">
>.
```

#### 消息处理优先级
1. **脚本回复**: 自动回复脚本中的自定义 JavaScript 逻辑
2. **文件回复**: 自动 S{stream}F{func+1} 文件匹配
3. **默认回复**: 奇数函数的标准 L() 响应

### 开发工作流

#### 添加新功能
1. 在 types.ts 中定义 TypeScript 接口
2. 创建组合函数用于状态管理
3. 使用正确的 props/emits 实现 Vue 组件
4. 在 electron 控制器中添加 IPC 处理程序
5. 在服务中实现业务逻辑

#### 测试方法
- 通过应用程序进行手动 UI 测试
- 使用外部模拟器验证 SECS 通信
- 检查日志输出以确保正确的消息处理
- 验证配置持久性

### 常见模式

#### IPC 通信
```typescript
// 前端
import { ipc } from '@/utils/ipcRenderer'
const result = await ipc.invoke(ipcApiRoute.getEngineConfig, params)

// 后端控制器
ipcMain.handle(ipcApiRoute.getEngineConfig, async (event, params) => {
  return await engineService.getConfig()
})
```

#### 响应式状态管理
```typescript
// 组合模式
export function useEngine() {
  const engineList = ref<EngineData[]>([])

  const loadEngineConfigs = async () => {
    // 异步操作
    engineList.value = result
  }

  return {
    engineList,
    loadEngineConfigs
  }
}
```

#### 表单验证
```typescript
const buildEngineConfigFromForm = (formData: any) => {
  const toNumber = (value: unknown) => {
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }

  // 安全类型转换
  const config: Record<string, any> = {
    deviceId: toNumber(formData.deviceId),
    port: toNumber(formData.tcpPort)
  }
}
```

### 质量保证

#### 代码审查清单
- [ ] TypeScript 严格模式合规
- [ ] 使用 try-catch 的适当错误处理
- [ ] 公共方法的 JSDoc 注释
- [ ] 一致的命名约定
- [ ] 无未使用的导入或变量
- [ ] Vue 组件正确类型化
- [ ] IPC 通信正确类型化

#### 提交前检查
- [ ] 在前端运行 `npm run type-check`
- [ ] 测试应用程序启动
- [ ] 验证 IPC 通信工作
- [ ] 检查控制台错误
- [ ] 验证配置加载/保存

本指南确保所有在 SECS Simulator 项目上工作的 AI 代理保持一致的代码质量和开发实践。