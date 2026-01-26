# i18n 国际化实现总结

## 已完成的工作

### 1. 安装依赖
- 安装了 `vue-i18n@9` 包

### 2. 创建 i18n 配置
- `src/i18n/index.ts` - i18n 主配置文件
- `src/i18n/locales/en.ts` - 英文翻译文件
- `src/i18n/locales/zh.ts` - 中文翻译文件

### 3. 集成到应用
- 在 `main.ts` 中引入并注册 i18n 插件
- 语言偏好保存在 localStorage 中，默认为英文

### 4. 创建语言切换组件
- `src/components/LanguageSwitcher.vue` - 语言切换下拉菜单
- 位于顶栏右侧，Logo 和标题之前
- 显示当前语言（English / 中文）
- 点击可切换语言

### 5. 更新主页面
- `src/views/home/Index.vue` 已集成 i18n
- 顶栏按钮、标题已国际化
- 日志面板标题已国际化
- 消息提示已国际化

### 6. 创建工具函数
- `src/composables/useLocale.ts` - 语言管理 composable
- 提供 `setLocale` 和 `toggleLocale` 方法

### 7. 文档
- `src/i18n/README.md` - i18n 使用指南

## 已翻译的模块

✅ 通用文本（common）
✅ 顶栏（toolbar）
✅ 引擎管理（engine）
✅ 文件树（fileTree）
✅ 文件预览（filePreview）
✅ 日志面板（logs）
✅ 自动回复（autoReply）
✅ 事件绑定（eventBind）
✅ 自动流程（autoFlow）
✅ 模态框（modal）

## 待完成的工作

以下组件需要根据实际需要逐步添加 i18n 支持：

### 需要国际化的组件
1. `EngineList.vue` - 引擎列表组件
2. `FileTree.vue` - 文件树组件
3. `FilePreview.vue` - 文件预览组件
4. `LogPanel.vue` - 日志面板组件
5. `AutoReplyPanel.vue` - 自动回复面板组件
6. `AddEngineModal.vue` - 添加引擎模态框
7. `FileEditorModal.vue` - 文件编辑器模态框
8. `AddFolderModal.vue` - 添加文件夹模态框
9. `AutoReplyModal.vue` - 自动回复模态框
10. `EventBindModal.vue` - 事件绑定模态框
11. `AutoFlowDrawer.vue` - 自动流程抽屉

### 需要国际化的 Composables
1. `useEngine.ts` - 引擎管理（消息提示）
2. `useFileTree.ts` - 文件树管理（消息提示）
3. `useAutoReply.ts` - 自动回复管理（消息提示）
4. `useEventBind.ts` - 事件绑定管理（消息提示）

## 使用示例

### 在组件中使用
```vue
<template>
  <div>{{ t('common.save') }}</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
```

### 带参数的翻译
```typescript
t('fileTree.sendSuccess', { file: 'test.txt', engine: 'HOST' })
```

### 切换语言
```typescript
import { useLocale } from '@/composables/useLocale'
const { setLocale } = useLocale()
setLocale('zh') // 切换到中文
```

## 测试清单

- [x] 类型检查通过（`npm run type-check`）
- [ ] 应用正常启动（`npm run dev`）
- [ ] 语言切换功能正常
- [ ] 中英文显示正确
- [ ] 语言偏好持久化（刷新后保持）

## 注意事项

1. 所有新增的文本都应该使用 `t()` 函数包裹
2. 在 `en.ts` 和 `zh.ts` 中同步添加翻译
3. 使用有意义的翻译键名，按模块组织
4. 消息提示（Message）也应该使用 i18n
5. 表单验证消息也应该国际化

## 下一步建议

1. 逐个更新子组件，添加 i18n 支持
2. 更新 composables 中的消息提示
3. 添加表单验证的国际化
4. 测试所有功能在两种语言下的表现
5. 根据实际使用情况补充翻译文本
