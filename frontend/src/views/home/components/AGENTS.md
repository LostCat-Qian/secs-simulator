# Components Development Guide

**Generated:** 2026-01-12

## OVERVIEW
UI components using Vue 3 script setup, Arco Design, and TypeScript for mixed visual/logic presentation.

## STRUCTURE
```
components/
├── Display Panels    # LogPanel.vue, EngineList.vue, FileTree.vue, AutoReplyPanel.vue
├── Edit Panels       # FilePreview.vue, FileEditorModal.vue
├── Modals            # *Modal.vue (6 files - AddEngine, AutoReply, AutoFlow, EventBind, AddFolder, FileEditor)
└── Tree Views        # FileTree.vue (hierarchical file navigation)
```

## WHERE TO LOOK
- **Modals**: `visible` ref pattern, props `initialData`, emits `submit`/`update:visible`
- **Lists**: EngineList.vue for item selection + dropdown menus, FileTree.vue for hierarchical search
- **Editors**: AutoReplyModal.vue (Monaco editor), FileEditorModal.vue (text editor)
- **Panels**: LogPanel.vue (auto-scroll, search filter)

## CONVENTIONS
- **Component naming**: `XxxModal.vue` (modals), descriptive names for panels
- **Props/Emits**: Props for data input, emits for actions (`add`, `select`, `submit`, `update:visible`)
- **Template**: `<script setup lang="ts">`, strict TypeScript, typed props/emits
- **Icons**: Import from `@arco-design/web-vue/es/icon` individually
- **Styling**: `<style scoped lang="less">`, use CSS vars (`var(--color-bg-2)`), `:deep()` for library overrides
- **Modal pattern**: `watch(() => props.visible, (val) => { if (val) { resetForm() } })`
- **Event handling**: `$emit('action', payload)` in template, `emit('action', payload)` in script

## ANTI-PATTERNS
- ❌ Inline complex logic in template - extract to methods
- ❌ Mixing business logic in components - delegate to composables
- ❌ Modifying props directly - emit events instead
- ❌ Hardcoded engine/tool selection - pass as props or use composables
- ❌ Unstyled overflow containers - always add `overflow-y: auto` for scrollable areas
- ❌ Missing empty states - add `a-empty` or conditional rendering
