# ElectronEgg 前端项目说明

## 项目概述

这是 ElectronEgg 桌面应用的前端部分，基于 Vue 3 + TypeScript + Vite 构建，采用现代化的前端技术栈和组件库，提供高性能、类型安全的开发体验。

### 核心特性

- **框架版本**：Vue 3.5.12 使用 Composition API 和 `<script setup>` 语法
- **类型安全**：TypeScript 5.9.3，启用严格模式
- **构建工具**：Vite 5.4.11，提供快速的开发体验
- **路由管理**：Vue Router 4.0.14，使用 Hash 模式
- **样式方案**：
  - Less 4.1.2（CSS 预处理器）
  - 支持自定义主题变量
- **UI 组件库**：
  - PrimeVue（功能丰富的 Vue 3 组件库）
  - 支持 Aura 主题
  - 自动导入组件，无需手动注册
- **代码质量**：
  - ESLint 代码检查
  - TypeScript 类型检查
  - 生产环境代码压缩（Terser）

### 项目结构

```
frontend/
├── src/
│   ├── api/                # API 接口定义（IPC 通信频道）
│   │   └── index.ts        # 通信频道映射
│   ├── assets/             # 静态资源
│   │   ├── global.less     # 全局样式
│   │   └── logo.png        # Logo 图片
│   ├── components/         # 组件目录
│   │   └── global/         # 全局组件（自动注册）
│   │       └── index.ts    # 全局组件入口
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数
│   ├── router/             # 路由配置
│   │   ├── index.ts        # 路由实例
│   │   └── routerMap.ts    # 路由映射
│   ├── utils/              # 工具函数
│   │   └── ipcRenderer.ts  # Electron IPC 通信封装
│   ├── views/              # 页面组件
│   │   └── example/        # 示例页面
│   │       └── hello/      # Hello World 页面
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口
│   └── style.css           # 全局样式
├── public/                 # 公共静态资源
├── dist/                   # 构建输出目录
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── index.html              # HTML 模板
├── package.json            # 项目依赖和脚本
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 构建配置
└── tsconfig.node.json      # Node.js TypeScript 配置
```

## 开发命令

### 开发模式

```bash
# 启动开发服务器（端口 8080）
npm run dev

# 同上（别名）
npm run serve
```

开发服务器启动后，应用将在 `http://localhost:8080` 运行。

### 构建命令

```bash
# 完整构建（类型检查 + 构建）
npm run build

# 仅构建（跳过类型检查）
npm run build-only

# Staging 环境构建
npm run build-staging
```

### 类型检查

```bash
# 仅进行 TypeScript 类型检查
npm run type-check
```

### 预览构建结果

```bash
# 预览生产构建
npm run preview
```

## 开发规范

### 组件开发

1. **使用 Composition API**：
   - 所有组件使用 `<script setup>` 语法
   - 使用 `defineProps`、`defineEmits` 等编译器宏
   - 优先使用 Composition API 的响应式 API（ref、reactive、computed 等）

2. **全局组件**：
   - 放在 `src/components/global/` 目录下
   - 自动注册，无需手动导入
   - 命名使用 PascalCase（如 `Button.vue`）

3. **UI 组件**：
   - 使用 PrimeVue 组件库
   - 支持自动导入，无需手动注册
   - 直接在组件中使用，无需导入
   - 示例：
     ```vue
     <template>
       <Button label="点击我" />
     </template>
     ```

4. **页面组件**：
   - 放在 `src/views/` 目录下
   - 按功能模块组织目录结构
   - 每个页面使用 PascalCase 命名（如 `Index.vue`）

### 路由管理

1. **路由配置**：
   - 使用 Vue Router 4 的 Hash 模式（`createWebHashHistory`）
   - 路由映射定义在 `src/router/routerMap.ts`
   - 支持懒加载（`component: () => import(...)`）
   - 使用 `RouteRecordRaw` 类型确保类型安全

2. **路由示例**：
   ```typescript
   const constantRouterMap: RouteRecordRaw[] = [
     {
       path: '/',
       name: 'Example',
       redirect: { name: 'ExampleHelloIndex' },
       children: [
         {
           path: '/example',
           name: 'ExampleHelloIndex',
           component: () => import('@/views/example/hello/Index.vue')
         }
       ]
     }
   ]
   ```

### IPC 通信

1. **通信定义**（`src/api/index.ts`）：
   - 定义所有 IPC 通信频道
   - 使用接口类型确保类型安全
   - 示例：
     ```typescript
     interface IpcApiRoute {
       test: string
     }

     const ipcApiRoute: IpcApiRoute = {
       test: 'controller/example/test'
     }
     ```

2. **通信使用**（`src/utils/ipcRenderer.ts`）：
   - 导入 `ipc` 对象进行通信
   - 使用 `ipc.invoke()` 发送异步消息
   - 示例：
     ```typescript
     import { ipc } from '@/utils/ipcRenderer'

     const result = await ipc.invoke('controller/example/test', params)
     ```

3. **Electron API 访问**：
   - 通过 `window.require('electron')` 访问 Electron API
   - 在非 Electron 环境下会自动降级

### 样式开发

1. **Less 预处理器**：
   - 用于复杂样式和主题变量
   - 配置文件：`vite.config.ts`
   - 支持自定义变量（如 `@border-color-base`）

2. **样式规范**：
   - 使用 Less 编写样式
   - 保持样式的一致性和可维护性
   - PrimeVue 组件自带样式，无需额外配置

### TypeScript 使用

1. **类型定义**：
   - 启用严格模式（`strict: true`）
   - 使用 `interface` 或 `type` 定义类型
   - 导出类型供其他文件使用

2. **类型检查**：
   - 开发时使用 `npm run type-check` 检查类型
   - 构建时自动进行类型检查（`npm run build`）

3. **类型导入**：
   - 使用 `import type` 导入类型
   - 避免运行时导入类型

## 配置说明

### 环境变量

- **开发环境**（`.env.development`）：
  - `VITE_TITLE`：应用标题
  - `VITE_GO_URL`：后端 API 地址（`http://localhost:8081`）

- **生产环境**（`.env.production`）：
  - `VITE_TITLE`：应用标题
  - `VITE_GO_URL`：生产环境 API 地址（`http://www.test.com`）

使用方式：
```typescript
const apiUrl = import.meta.env.VITE_GO_URL
```

### Vite 配置

- **基础配置**：
  - `base: './'`：相对路径部署
  - `publicDir: 'public'`：静态资源目录
  - 路径别名：`@` → `src`

- **CSS 配置**：
  - Less 预处理器支持
  - 自定义主题变量
  - PrimeVue 组件自动导入

- **构建配置**：
  - 输出目录：`dist`
  - 资源内联限制：4096 字节
  - 代码压缩：Terser
  - 生产环境移除 debugger（保留 console）

### TypeScript 配置

- **编译选项**：
  - 目标：ES2020
  - 模块：ESNext
  - 模块解析：bundler
  - 严格模式：启用
  - 路径映射：`@/*` → `./src/*`
  - 类型：Node.js 和 Vite Client

- **类型检查**：
  - 未使用变量：报错
  - 未使用参数：报错
  - Switch 语句穿透：报错

### PrimeVue 配置

- **主题**：Aura 主题（默认）
- **自动导入**：启用，无需手动导入组件
- **配置位置**：`src/main.ts`
- **配置示例**：
  ```typescript
  import PrimeVue from 'primevue/config'
  import Aura from '@primevue/themes/aura'

  app.use(PrimeVue, {
    theme: {
      preset: Aura
    }
  })
  ```

## 依赖管理

### 生产依赖

- `vue@^3.5.12`：Vue 3 框架
- `vue-router@^4.0.14`：路由管理
- `primevue`：PrimeVue 组件库
- `@primevue/themes`：PrimeVue 主题

### 开发依赖

- `vite@^5.4.11`：构建工具
- `@vitejs/plugin-vue@^4.2.3`：Vue 3 插件
- `typescript@^5.9.3`：TypeScript 编译器
- `vue-tsc@^3.2.1`：Vue TypeScript 类型检查
- `less@^4.1.2`：Less 预处理器
- `less-loader@^10.2.0`：Less 加载器
- `terser@^5.19.1`：JavaScript 压缩工具
- `@types/node@^25.0.3`：Node.js 类型定义
- `unplugin-vue-components`：Vue 组件自动导入插件
- `@primevue/auto-import-resolver`：PrimeVue 自动导入解析器

## 开发流程

### 1. 初始化项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. 开发新功能

**前端开发流程**：
1. 在 `src/views/` 创建页面组件
2. 在 `src/router/routerMap.ts` 添加路由配置
3. 使用 Composition API 编写组件逻辑
4. 在 `src/api/index.ts` 定义 IPC 通信频道（如需与主进程通信）
5. 使用 Less 编写样式

**UI 组件使用**：
1. PrimeVue 组件支持自动导入，无需手动安装
2. 直接在组件中使用，无需导入
3. 示例：
   ```vue
   <template>
     <Button label="点击我" />
     <InputText v-model="value" />
   </template>
   ```

### 3. 调试

- **前端调试**：使用浏览器开发者工具（F12）
- **类型检查**：运行 `npm run type-check`
- **构建调试**：运行 `npm run build` 查看构建错误

### 4. 构建和部署

```bash
# 完整构建（类型检查 + 构建）
npm run build

# 预览构建结果
npm run preview
```

构建输出在 `dist/` 目录，可以部署到 Electron 主进程的 `public/dist/` 目录。

## 注意事项

1. **路由模式**：项目使用 Hash 模式路由，部署时无需配置服务器重定向规则
2. **路径别名**：使用 `@` 别名引用 `src` 目录下的文件，避免相对路径
3. **类型安全**：所有代码都应通过 TypeScript 类型检查
4. **组件注册**：全局组件放在 `src/components/global/`，PrimeVue 组件自动导入
5. **样式开发**：使用 Less 编写样式，PrimeVue 组件自带样式
6. **环境变量**：修改 `.env.*` 文件后需要重启开发服务器才能生效
7. **IPC 通信**：使用异步方法 `ipc.invoke()`，避免使用同步方法阻塞渲染进程
8. **构建输出**：构建产物输出到 `dist/` 目录，由 Electron 主进程加载
9. **资源处理**：小于 4096 字节的资源会被内联为 Base64，超过此大小的资源会单独打包
10. **代码压缩**：生产环境使用 Terser 压缩代码，移除 debugger（保留 console）

## 相关资源

- Vue 3 文档：https://cn.vuejs.org/
- Vite 文档：https://cn.vitejs.dev/
- Vue Router 文档：https://router.vuejs.org/zh/
- PrimeVue 文档：https://primevue.org/
- Electron 文档：https://www.electronjs.org/zh/docs/latest/
- ElectronEgg 项目文档：https://www.kaka996.com/