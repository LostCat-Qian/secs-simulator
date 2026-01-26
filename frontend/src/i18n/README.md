# i18n 国际化使用指南

## 概述

本项目使用 `vue-i18n` 实现国际化功能，支持中英文切换。

## 目录结构

```
src/i18n/
├── index.ts           # i18n 配置入口
├── locales/
│   ├── en.ts         # 英文翻译
│   └── zh.ts         # 中文翻译
└── README.md         # 本文档
```

## 使用方法

### 1. 在组件中使用

```vue
<template>
  <div>
    <h1>{{ t('toolbar.appTitle') }}</h1>
    <button>{{ t('common.save') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
```

### 2. 使用 composable

```typescript
import { useLocale } from '@/composables/useLocale'

const { t, locale, setLocale } = useLocale()

// 切换语言
setLocale('zh') // 切换到中文
setLocale('en') // 切换到英文
```

### 3. 带参数的翻译

```typescript
// 在语言文件中定义
export default {
  fileTree: {
    sendSuccess: 'Sent {file} to {engine}'
  }
}

// 在组件中使用
t('fileTree.sendSuccess', { file: 'test.txt', engine: 'HOST' })
// 输出: "Sent test.txt to HOST"
```

## 添加新的翻译

### 1. 在 `locales/en.ts` 中添加英文翻译

```typescript
export default {
  myModule: {
    title: 'My Module',
    description: 'This is my module'
  }
}
```

### 2. 在 `locales/zh.ts` 中添加对应的中文翻译

```typescript
export default {
  myModule: {
    title: '我的模块',
    description: '这是我的模块'
  }
}
```

### 3. 在组件中使用

```vue
<template>
  <h1>{{ t('myModule.title') }}</h1>
  <p>{{ t('myModule.description') }}</p>
</template>
```

## 语言切换

用户可以通过顶栏右侧的语言切换按钮切换语言。选择的语言会保存在 `localStorage` 中，下次打开应用时会自动加载。

## 翻译键命名规范

- 使用小驼峰命名法（camelCase）
- 按模块组织翻译键
- 通用翻译放在 `common` 模块下
- 模块特定翻译放在对应模块下

示例：
```
common.save          # 通用的"保存"按钮
engine.add           # 引擎模块的"添加"按钮
fileTree.addFile     # 文件树模块的"添加文件"按钮
```

## 当前支持的模块

- `common` - 通用翻译（按钮、状态等）
- `toolbar` - 顶栏
- `engine` - 引擎管理
- `fileTree` - 文件树
- `filePreview` - 文件预览
- `logs` - 日志面板
- `autoReply` - 自动回复脚本
- `eventBind` - 事件绑定
- `autoFlow` - 自动流程
- `modal` - 模态框标题
