# ElectronEgg 主进程项目说明

## 项目概述

这是 ElectronEgg 桌面应用的主进程代码目录。ElectronEgg 是一个基于 Electron 的企业级桌面应用开发框架，采用前后端分离架构，支持快速开发跨平台桌面应用。

### 核心特性

- **框架版本**：ee-core 4.1.5 + Electron 39.2.6
- **架构模式**：MVC 架构（Controller-Service 模式）
- **通信机制**：IPC（进程间通信）
- **生命周期管理**：支持应用启动、窗口就绪、关闭前等生命周期钩子
- **配置管理**：支持多环境配置（默认、本地开发、生产环境）
- **预加载机制**：支持预加载脚本和上下文桥接

### 目录结构

```
electron/
├── main.js              # 应用入口文件
├── config/              # 配置文件目录
│   ├── config.default.js   # 默认配置
│   ├── config.local.js     # 本地开发配置（覆盖默认配置）
│   └── config.prod.js      # 生产环境配置（覆盖默认配置）
├── controller/          # 控制器层（处理前端 IPC 请求）
│   └── example.js          # 示例控制器
├── service/             # 服务层（业务逻辑）
│   └── example.js          # 示例服务
└── preload/             # 预加载脚本
    ├── index.js            # 预加载入口
    ├── bridge.js           # 上下文桥接（contextIsolation 开启时使用）
    └── lifecycle.js        # 生命周期管理
```

## 开发规范

### Controller 层开发

Controller 层负责接收前端通过 IPC 发送的请求，调用 Service 层处理业务逻辑，并将结果返回给前端。

**文件位置**：`controller/` 目录

**命名规范**：
- 文件名小写，使用连字符分隔（如 `user.js`）
- 类名使用大驼峰命名（如 `UserController`）
- 导出时添加 `toString` 方法用于调试

**方法签名**：
```javascript
/**
 * 所有方法接收两个参数
 * @param args - 前端传递的参数
 * @param event - IPC 通信事件对象（ipc 通信时才有值）
 */
async methodName(args, event) {
  // 调用 Service 层
  const result = await someService.someMethod(args);
  // 返回结果给前端
  return result;
}
```

**示例**：
```javascript
'use strict'

const { logger } = require('ee-core/log')
const { exampleService } = require('../service/example')

class ExampleController {
  async test(args, event) {
    const result = await exampleService.test('electron')
    logger.info('service result:', result)
    return 'hello electron-egg'
  }
}
ExampleController.toString = () => '[class ExampleController]'

module.exports = ExampleController
```

### Service 层开发

Service 层负责处理业务逻辑，包括数据库操作、第三方 API 调用、复杂计算等。

**文件位置**：`service/` 目录

**命名规范**：
- 文件名小写，使用连字符分隔（如 `user.js`）
- 类名使用大驼峰命名（如 `UserService`）
- 导出类实例和类定义

**示例**：
```javascript
'use strict'

const { logger } = require('ee-core/log')

class ExampleService {
  async test(args) {
    let obj = {
      status: 'ok',
      params: args
    }
    logger.info('ExampleService obj:', obj)
    return obj
  }
}
ExampleService.toString = () => '[class ExampleService]'

module.exports = {
  ExampleService,
  exampleService: new ExampleService()
}
```

### IPC 通信规范

前端与主进程通过 IPC 进行通信：

**通信流程**：
1. 前端调用 `ipc.invoke('controller/example/test', params)`
2. 主进程路由到 `controller/example.js` 的 `test` 方法
3. Controller 调用 Service 处理业务逻辑
4. 返回结果给前端

**控制器路径格式**：`controller/{文件名}/{方法名}`

例如：
- `controller/example/test` → `controller/example.js` 的 `test` 方法
- `controller/user/getInfo` → `controller/user.js` 的 `getInfo` 方法

### 配置管理

配置文件位于 `config/` 目录，按优先级加载：

1. **config.default.js**：默认配置（所有环境共享）
2. **config.local.js**：本地开发配置（覆盖默认配置，不提交到版本控制）
3. **config.prod.js**：生产环境配置（覆盖默认配置）

**主要配置项**：

```javascript
{
  openDevTools: false,              // 是否打开开发者工具
  singleLock: true,                 // 是否单实例运行
  windowsOption: {
    title: 'electron-egg',          // 窗口标题
    width: 980,                     // 窗口宽度
    height: 650,                    // 窗口高度
    minWidth: 400,                  // 最小宽度
    minHeight: 300,                 // 最小高度
    webPreferences: {
      contextIsolation: false,      // 上下文隔离（false=渲染进程可直接使用 Electron API）
      nodeIntegration: true,        // Node.js 集成（true=渲染进程可使用 Node API）
    },
    frame: true,                    // 是否显示窗口边框
    show: true,                     // 是否立即显示窗口
    icon: 'path/to/icon.png'        // 窗口图标
  },
  logger: {
    level: 'INFO',                  // 日志级别
    outputJSON: false,              // 是否输出 JSON 格式日志
    appLogName: 'ee.log',           // 应用日志文件名
    coreLogName: 'ee-core.log',     // 核心日志文件名
    errorLogName: 'ee-error.log'    // 错误日志文件名
  },
  remote: {
    enable: false,                  // 是否启用远程加载
    url: 'http://example.com/'     // 远程加载地址
  },
  socketServer: {
    enable: false,                  // 是否启用 Socket 服务器
    port: 7070,                     // Socket 端口
    // ... 其他 Socket 配置
  },
  httpServer: {
    enable: false,                  // 是否启用 HTTP 服务器
    host: '127.0.0.1',             // 主机地址
    port: 7071,                     // HTTP 端口
    // ... 其他 HTTP 配置
  },
  mainServer: {
    indexPath: '/public/dist/index.html',  // 主页面路径
    channelSeparator: '/',                  // IPC 通道分隔符
  }
}
```

### 生命周期管理

生命周期钩子在 `preload/lifecycle.js` 中定义，在 `main.js` 中注册：

**可用的生命周期钩子**：

1. **ready**：核心应用已加载
   ```javascript
   async ready() {
     logger.info('[lifecycle] ready')
   }
   ```

2. **electron-app-ready**：Electron 应用就绪
   ```javascript
   async electronAppReady() {
     logger.info('[lifecycle] electron-app-ready')
   }
   ```

3. **window-ready**：主窗口已加载
   ```javascript
   async windowReady() {
     logger.info('[lifecycle] window-ready')
     // 延迟显示窗口，避免白屏
     const { windowsOption } = getConfig()
     if (windowsOption.show == false) {
       const win = getMainWindow()
       win.once('ready-to-show', () => {
         win.show()
         win.focus()
       })
     }
   }
   ```

4. **before-close**：应用关闭前
   ```javascript
   async beforeClose() {
     logger.info('[lifecycle] before-close')
     // 清理资源、保存数据等
   }
   ```

### 预加载模块

预加载模块在应用启动时加载，可用于：

**1. 预加载入口**（`preload/index.js`）：
```javascript
const { logger } = require('ee-core/log');

function preload() {
  logger.info('[preload] load 1');
  // 初始化逻辑
}

module.exports = {
  preload
}
```

**2. 上下文桥接**（`preload/bridge.js`）：
当 `contextIsolation` 为 `true` 时使用，通过 `contextBridge` 向渲染进程暴露 API：

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer,
  // 可以暴露其他 API
})
```

渲染进程使用：
```javascript
window.electron.ipcRenderer.invoke('controller/example/test', params)
```

## 开发流程

### 1. 创建新功能

**步骤**：
1. 在 `service/` 创建 Service 类处理业务逻辑
2. 在 `controller/` 创建 Controller 类处理前端请求
3. 前端通过 IPC 调用控制器方法

**示例**：
```javascript
// service/user.js
class UserService {
  async getUserInfo(userId) {
    // 业务逻辑
    return { id: userId, name: 'John' };
  }
}
module.exports = {
  UserService,
  userService: new UserService()
}

// controller/user.js
class UserController {
  async getUserInfo(args, event) {
    const result = await userService.getUserInfo(args.userId);
    return result;
  }
}
module.exports = UserController
```

### 2. 添加配置

在 `config/config.default.js` 中添加默认配置，在 `config/config.local.js` 中覆盖本地配置。

### 3. 日志记录

使用 ee-core 提供的 logger：
```javascript
const { logger } = require('ee-core/log');

logger.info('信息日志');
logger.warn('警告日志');
logger.error('错误日志');
logger.debug('调试日志');
```

## 重要注意事项

### 上下文隔离（Context Isolation）

- **默认设置**：`contextIsolation: false`
- **含义**：渲染进程可直接使用 Electron API
- **启用场景**：需要更高的安全性时
- **启用后**：
  - 必须配置 `preload/bridge.js` 通过 `contextBridge` 暴露 API
  - 渲染进程通过 `window.electron.xxx` 访问暴露的 API

### Node 集成（Node Integration）

- **默认设置**：`nodeIntegration: true`
- **含义**：渲染进程可使用 Node.js API（如 `require`、`fs` 等）
- **安全建议**：生产环境建议配合 `contextIsolation: true` 使用

### 配置文件管理

- `config.local.js` 不应提交到版本控制
- 敏感信息（API 密钥、数据库密码等）应放在环境变量或 `config.local.js` 中

### IPC 通信

- 使用异步方法 `ipc.invoke()`，避免使用同步方法阻塞渲染进程
- Controller 方法必须是 `async` 函数
- 返回的数据会自动序列化为 JSON

### 单实例锁

- `singleLock: true` 时，同一时间只能运行一个应用实例
- 再次启动会聚焦到已打开的窗口

## 常见问题

### 1. 如何调试主进程？

在 `config/config.local.js` 中设置：
```javascript
module.exports = () => {
  return {
    openDevTools: true
  };
};
```

### 2. 如何启用上下文隔离？

在 `config/config.default.js` 中：
```javascript
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,  // 建议同时禁用 Node 集成
  preload: path.join(getElectronDir(), 'preload', 'bridge.js'),
}
```

### 3. 如何添加新的生命周期钩子？

在 `preload/lifecycle.js` 中添加方法，在 `main.js` 中注册：
```javascript
// lifecycle.js
async customHook() {
  logger.info('[lifecycle] custom-hook')
}

// main.js
app.register("custom-hook", life.customHook);
```

### 4. Controller 和 Service 的区别？

- **Controller**：处理前端请求，参数验证，调用 Service，返回结果
- **Service**：处理业务逻辑，数据库操作，第三方 API 调用

### 5. 如何访问主窗口？

```javascript
const { getMainWindow } = require('ee-core/electron');
const win = getMainWindow();
```

## 相关资源

- **ElectronEgg 官方文档**：https://www.kaka996.com/
- **GitHub**：https://github.com/dromara/electron-egg
- **Gitee**：https://gitee.com/dromara/electron-egg
- **ee-core**：https://github.com/wallace5303/ee-core
- **Electron 官方文档**：https://www.electronjs.org/docs