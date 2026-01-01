# SECS Simulator 项目说明

## 项目概述

SECS Simulator 是一个基于 ElectronEgg 和 secs4js 的 SECS（Semiconductor Equipment Communications Standard）模拟器。该框架基于 Electron 构建，采用前后端分离的架构设计，支持 JavaScript 和 TypeScript，旨在为半导体设备通信提供功能完整的模拟测试环境。

### 核心特性

- **跨平台支持**：一套代码可打包为 Windows、macOS、Linux 版本，以及 UOS、Deepin、麒麟等国产系统版本
- **架构灵活**：支持单业务进程/模块化/多任务（进程、线程、渲染进程）架构
- **技术栈**：
  - 主进程：Node.js + Electron 39.2.6 + ee-core 4.1.5
  - 前端：Vue 3.5.26 + Vite 5.4.21 + Vue Router 4.6.4 + TypeScript 5.9.3
  - UI 组件：Arco Design 2.57.0
  - 代码编辑器：Monaco Editor 0.55.1
  - 通信：IPC (Inter-Process Communication)
- **工程化**：采用前后端分离的开发理念，支持热更新
- **安全性**：支持字节码加密、压缩和混淆加密
- **功能丰富**：内置配置管理、通信、插件、数据库、升级、打包、工具等功能

### 主要功能

- **引擎管理**：创建、编辑、删除、启动和停止 SECS 通信引擎
- **文件管理**：管理和预览 SECS 脚本文件
- **日志查看**：实时查看和监控 SECS 通信日志
- **自动回复**：配置和管理 SECS 消息的自动回复规则
- **代码编辑**：集成 Monaco Editor 提供强大的代码编辑功能

### 项目结构

```
secs-simulator/
├── electron/                 # Electron 主进程代码
│   ├── main.js              # 应用入口文件
│   ├── config/              # 配置文件
│   │   ├── config.default.js # 默认配置
│   │   ├── config.local.js   # 本地开发配置（不提交版本控制）
│   │   └── config.prod.js    # 生产环境配置
│   ├── controller/          # 控制器层（处理前端请求）
│   ├── preload/             # 预加载脚本
│   │   ├── index.js         # 预加载入口
│   │   ├── bridge.js        # contextBridge 桥接
│   │   └── lifecycle.js     # 生命周期钩子
│   └── service/             # 业务逻辑层
├── frontend/                # 前端代码
│   ├── src/
│   │   ├── api/            # API 接口定义（TypeScript）
│   │   ├── assets/         # 静态资源（样式、图片等）
│   │   │   └── global.less  # 全局样式
│   │   ├── components/     # 全局组件
│   │   │   └── global/     # 全局组件注册
│   │   ├── router/         # 路由配置
│   │   │   ├── index.ts    # 路由实例
│   │   │   └── routerMap.ts # 路由映射
│   │   ├── utils/          # 工具函数（包含 ipcRenderer.ts）
│   │   └── views/          # 页面组件
│   │       ├── home/       # 主页面
│   │       │   ├── Index.vue
│   │       │   └── components/ # 主页面组件
│   │       │       ├── AddEngineModal.vue    # 添加/编辑引擎模态框
│   │       │       ├── AutoReplyPanel.vue    # 自动回复面板
│   │       │       ├── EngineList.vue        # 引擎列表
│   │       │       ├── FilePreview.vue       # 文件预览
│   │       │       ├── FileTree.vue          # 文件树
│   │       │       └── LogPanel.vue          # 日志面板
│   │       └── example/     # 示例页面
│   ├── .env.development    # 开发环境变量
│   ├── .env.production     # 生产环境变量
│   ├── index.html          # HTML 模板
│   └── vite.config.ts      # Vite 配置（TypeScript）
├── public/                  # 公共资源
│   ├── dist/               # 前端构建输出
│   ├── electron/           # Electron 构建输出（不提交版本控制）
│   ├── html/               # HTML 文件（loading.html 等）
│   ├── images/             # 图片资源
│   └── ssl/                # SSL 证书
├── build/                   # 构建配置
│   ├── icons/              # 应用图标
│   ├── extraResources/     # 额外资源
│   │   └── dll/            # DLL 文件
│   └── script/             # 安装脚本
├── cmd/                     # 构建配置文件
│   ├── builder.json        # Windows 构建配置
│   ├── builder-mac.json    # macOS 构建配置
│   ├── builder-mac-arm64.json # macOS ARM64 构建配置
│   └── builder-linux.json  # Linux 构建配置
├── data/                    # 本地数据存储（不提交版本控制）
├── logs/                    # 日志文件（不提交版本控制）
└── run/                     # 运行时文件（不提交版本控制）
```

## 开发命令

### 启动开发模式

```bash
# 同时启动前端和 Electron（推荐）
npm run dev

# 仅启动前端
npm run dev-frontend

# 仅启动 Electron
npm run dev-electron
```

### 构建命令

```bash
# 完整构建（前端 + Electron + 加密）
npm run build

# 仅构建前端
npm run build-frontend

# 仅构建 Electron
npm run build-electron

# 代码加密
npm run encrypt

# 生成图标
npm run icon
```

### 平台打包

```bash
# Windows 64位
npm run build-w

# Windows（加密版）
npm run build-we

# macOS
npm run build-m

# macOS (Apple Silicon M1/M2/M3)
npm run build-m-arm64

# Linux
npm run build-l
```

### 其他命令

```bash
# 重新构建 SQLite 原生模块
npm run re-sqlite
```

### 前端命令

```bash
# 前端开发服务器
npm run dev

# 前端生产构建（带类型检查）
npm run build

# 前端仅构建（不进行类型检查）
npm run build-only

# 前端预构建（staging 环境）
npm run build-staging

# 类型检查
npm run type-check

# 预览构建结果
npm run preview
```

## 开发规范

### 主进程开发

1. **Controller 层**：位于 `electron/controller/` 目录，负责接收前端请求并调用 Service 层
   - 所有方法接收 `args`（前端参数）和 `event`（IPC 通信事件）两个参数
   - 返回数据给前端

2. **Service 层**：位于 `electron/service/` 目录，负责业务逻辑处理
   - 与数据库交互、调用第三方 API 等

3. **配置管理**：在 `electron/config/` 目录下管理不同环境的配置
   - `config.default.js`：默认配置
   - `config.local.js`：本地开发配置（不提交到版本控制）
   - `config.prod.js`：生产环境配置

### 前端开发

1. **环境变量配置**：
   - 开发环境：`.env.development`（本地开发，端口 8081）
   - 生产环境：`.env.production`（生产环境，使用测试域名）
   - 在代码中通过 `import.meta.env.VITE_XXX` 访问

2. **API 通信**：
   - 在 `frontend/src/api/index.ts` 中定义 IPC 通信频道（使用 TypeScript 接口）
   - 使用 `frontend/src/utils/ipcRenderer.ts` 中的 `ipc.invoke()` 进行异步通信
   - 示例：`const result = await ipc.invoke('controller/example/test', params);`

3. **路由管理**：
   - 路由配置位于 `frontend/src/router/` 目录
   - 使用 Vue Router 4.6.4，采用 Hash 模式（createWebHashHistory）
   - `routerMap.ts` 定义路由映射，支持懒加载和类型安全

4. **Vite 配置**：
   - 开发服务器：`vite --host --port 8080`
   - 路径别名：`@` 指向 `src` 目录
   - Less 预处理器支持，可自定义主题变量
   - 构建输出：`dist` 目录
   - 生产环境自动压缩代码（terser）

5. **组件开发**：
   - 全局组件注册在 `frontend/src/components/global/index.ts`（自动导入）
   - 页面组件放在 `frontend/src/views/` 目录下
   - 使用 Vue 3 Composition API（`<script setup>`）和 TypeScript
   - 使用 Arco Design 组件库提供 UI 组件

6. **样式开发**：
   - 使用 Less 预处理器
   - 全局样式位于 `frontend/src/assets/global.less`
   - 支持自定义主题变量（如 `@border-color-base`）

### IPC 通信规范

前端与主进程通过 IPC 进行通信：

```typescript
// 前端调用
import { ipc } from '@/utils/ipcRenderer';
const result = await ipc.invoke('controller/example/test', params);

// 主进程处理（Controller）
async test(args, event) {
  // 业务逻辑
  return result;
}
```

### 代码风格

- 主进程使用 CommonJS 模块系统（`require/module.exports`）
- 前端使用 ES6 模块系统（`import/export`）和 TypeScript
- 遵循 JavaScript/TypeScript 最佳实践
- 使用 TypeScript 严格模式进行类型检查
- 使用 Vue 3 Composition API 和 `<script setup>` 语法
- 使用 Arco Design 组件库保持 UI 一致性

## 配置说明

### 主进程配置（config.default.js）

- `openDevTools`：是否打开开发者工具
- `singleLock`：是否单实例运行
- `windowsOption`：窗口配置（标题、大小、图标等）
  - `webPreferences.contextIsolation`：上下文隔离（默认 false）
  - `webPreferences.nodeIntegration`：是否集成 Node.js（默认 true）
- `logger`：日志配置（级别、输出格式、文件名）
- `remote`：远程加载配置
- `socketServer`：Socket 服务器配置（端口 7070）
- `httpServer`：HTTP 服务器配置（端口 7071）
- `mainServer`：主服务器配置

### 前端配置（vite.config.ts）

- **基础配置**：
  - `base: './'`：相对路径部署
  - `publicDir: 'public'`：静态资源目录
  - 路径别名：`@` → `src`

- **插件配置**：
  - `@vitejs/plugin-vue`：Vue 3 支持

- **CSS 配置**：
  - Less 预处理器支持
  - 可自定义主题变量（如 `@border-color-base`）

- **构建配置**：
  - 输出目录：`dist`
  - 资源内联限制：4096 字节
  - 代码压缩：terser
  - 生产环境移除 debugger（保留 console）

### 环境变量配置

- **开发环境**（`.env.development`）：
  - `VITE_TITLE`：应用标题
  - `VITE_GO_URL`：后端 API 地址（http://localhost:8081）

- **生产环境**（`.env.production`）：
  - `VITE_TITLE`：应用标题
  - `VITE_GO_URL`：生产环境 API 地址

## 依赖管理

### 主进程依赖

- `ee-core@^4.1.5`：框架核心包
- `electron@^39.2.6`：Electron 运行时
- `electron-updater@^6.7.3`：应用自动更新
- `electron-builder@^26.3.5`：应用打包工具
- `ee-bin@^4.2.0`：ElectronEgg 命令行工具

### 主进程开发依赖

- `@electron/rebuild@^3.7.1`：原生模块重建工具
- `@types/node@^22.19.1`：Node.js 类型定义
- `debug@^4.4.0`：调试工具

### 前端依赖

- `vue@^3.5.26`：Vue 3 框架
- `vue-router@^4.6.4`：路由管理
- `@arco-design/web-vue@^2.57.0`：Arco Design UI 组件库
- `monaco-editor@^0.55.1`：代码编辑器
- `@guolao/vue-monaco-editor@^1.6.0`：Monaco Editor 的 Vue 封装

### 前端开发依赖

- `vite@^5.4.21`：构建工具
- `@vitejs/plugin-vue@^4.6.2`：Vue 3 插件
- `@vue/compiler-sfc@^3.5.26`：Vue 单文件组件编译器
- `typescript@^5.9.3`：TypeScript 编译器
- `vue-tsc@^3.2.1`：Vue TypeScript 类型检查
- `less@^4.5.1`：Less 预处理器
- `less-loader@^10.2.0`：Less 加载器
- `terser@^5.44.1`：JavaScript 压缩工具
- `@types/node@^25.0.3`：Node.js 类型定义

## 预加载模块

预加载模块在 Electron 应用启动时加载，可用于：

1. **生命周期管理**（`preload/lifecycle.js`）：
   - `ready`：应用准备就绪
   - `electron-app-ready`：Electron 应用就绪
   - `window-ready`：窗口就绪
   - `before-close`：窗口关闭前

2. **上下文桥接**（`preload/bridge.js`）：
   - 当 `webPreferences.contextIsolation` 为 `true` 时使用
   - 通过 `contextBridge.exposeInMainWorld` 向渲染进程暴露 API
   - 提高安全性，隔离渲染进程和主进程

3. **预加载入口**（`preload/index.js`）：
   - 应用启动时执行的初始化逻辑
   - 可用于日志记录、全局变量初始化等

## 开发流程

### 1. 初始化项目

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev
```

### 2. 开发新功能

**主进程开发流程**：
1. 在 `electron/service/` 创建 Service 类处理业务逻辑
2. 在 `electron/controller/` 创建 Controller 类处理前端请求
3. 在 `frontend/src/api/index.ts` 定义 IPC 通信频道
4. 在前端页面调用 API

**前端开发流程**：
1. 在 `frontend/src/views/` 创建页面组件（使用 TypeScript）
2. 在 `frontend/src/router/routerMap.ts` 添加路由配置
3. 使用 Composition API 和 TypeScript 编写组件逻辑
4. 使用 Arco Design 组件构建 UI
5. 通过 IPC 与主进程通信

**组件开发流程**：
1. 创建组件文件（使用 `<script setup>` 和 TypeScript）
2. 使用 Arco Design 组件库的组件
3. 定义组件 Props 和 Emits 接口
4. 实现组件逻辑和样式
5. 在父组件中导入和使用

### 3. 调试

- **主进程调试**：在 `config.default.js` 中设置 `openDevTools: true`
- **前端调试**：使用浏览器开发者工具（F12）
- **日志查看**：查看 `logs/` 目录下的日志文件
- **类型检查**：运行 `npm run type-check` 进行 TypeScript 类型检查

### 4. 构建和打包

```bash
# 完整构建
npm run build

# 打包为 Windows 安装包
npm run build-w

# 打包为 macOS 应用
npm run build-m

# 打包为 Linux 应用
npm run build-l
```

## 注意事项

1. **SQLite 模块**：如果使用 SQLite 数据库，在安装依赖后需要运行 `npm run re-sqlite` 重新构建原生模块
2. **加密功能**：生产环境建议使用 `npm run encrypt` 对代码进行加密保护
3. **跨平台测试**：打包前请在目标平台进行充分测试
4. **版本控制**：以下文件和目录不应提交到版本控制系统：
   - `config.local.js` - 本地开发配置
   - `data/` - 本地数据存储
   - `logs/` - 日志文件
   - `run/` - 运行时文件
   - `public/electron/` - Electron 构建输出
   - `out/` - 打包输出目录
   - `.vscode/launch.json` - VSCode 启动配置
5. **IPC 通信**：使用 `ipc.invoke()` 进行异步通信，避免使用同步方法阻塞渲染进程
6. **环境变量**：修改 `.env.*` 文件后需要重启开发服务器才能生效
7. **路由模式**：项目使用 Hash 模式路由，部署时无需配置服务器重定向规则
8. **上下文隔离**：默认禁用上下文隔离（`contextIsolation: false`），如需启用请同时配置 `bridge.js`
9. **Node 集成**：默认启用 Node.js 集成（`nodeIntegration: true`），渲染进程可直接使用 Node API
10. **资源处理**：小于 4096 字节的资源会被内联为 Base64，超过此大小的资源会单独打包
11. **TypeScript**：前端使用 TypeScript 开发，确保类型安全，开发时可使用 `npm run type-check` 进行类型检查
12. **Arco Design**：使用 Arco Design 组件库时，请遵循组件库的使用规范和最佳实践
13. **Monaco Editor**：使用 Monaco Editor 时，注意资源加载和性能优化
14. **Less 样式**：自定义主题变量时，请在 `vite.config.ts` 中的 `css.preprocessorOptions.less.modifyVars` 中配置

## 项目信息

- **项目名称**：secs-simulator
- **项目描述**：基于 ElectronEgg 和 secs4js 的 SECS 模拟器
- **版本**：0.0.1
- **作者**：Ran Qian <1151264028@qq.com>
- **许可证**：Apache
- **仓库地址**：https://github.com/LostCat-Qian/secs-simulator.git
- **关键词**：Electron, electron-egg, ElectronEgg, secs, simulator, secs-simulator, secsgem, secs-i, secs-ii, secs-gem

## 相关资源

- 官方文档：https://www.kaka996.com/
- GitHub：https://github.com/dromara/electron-egg
- Gitee：https://gitee.com/dromara/electron-egg
- ee-core：https://github.com/wallace5303/ee-core
- Arco Design：https://arco.design/vue
- Monaco Editor：https://microsoft.github.io/monaco-editor/