# Composables Development Guide

**OVERVIEW:** Frontend business logic layer connecting Vue components to Electron IPC services.

## STRUCTURE

| File | Purpose | State Key IPC Routes |
|------|---------|---------------------|
| `useEngine.ts` | Engine CRUD & lifecycle | `engineList`, `getEngineConfig`, `engineStart`, `engineStop`, `saveEngineConfig`, `deleteEngine` |
| `useAutoReply.ts` | Auto-reply script management | `tableData`, `listScripts`, `getScript`, `addScript`, `updateScript`, `deleteScript` |
| `useLogPanels.ts` | Log panel state (pure frontend) | `logPanels`, none |
| `useFileTree.ts` | SML file tree navigation | `fileTreeData`, `smlFileTree`, `smlFolderCreate`, `smlFileSave`, `smlFileDelete` |
| `useAutoFlow.ts` | Automation flow execution | `flowList`, `currentFlow`, `runState`, `listAutoFlows`, `saveAutoFlow`, `runAutoFlow` |
| `useEventBind.ts` | GEM event binding generation | `saving`, `generating`, `generateEventBindFiles`, `saveEventBindFiles` |

## WHERE TO LOOK

- **Engine state**: `useEngine.ts` - `loadEngineConfigs()` initializes list, `updateEngineStatus()` reacts to IPC events
- **Panel management**: `useLogPanels.ts` - `addLogPanel()` ensures one panel per engine, `redistributePanelWidths()` handles layout
- **Flow execution**: `useAutoFlow.ts` - `handleRunEvent()` processes `autoflow/event` IPC push for real-time updates
- **File operations**: `useFileTree.ts` - `loadFileContent()`, `saveFile()` with `isCreateMode` flag for create/edit distinction
- **Form handling**: `useEngine.ts` - `buildEngineConfigFromForm()` converts form data with `toNumber()` helper

## CONVENTIONS

```typescript
// 1. IPC availability guard (all composables)
if (!ipc) { Message.error('...'); return }

// 2. State update pattern (immutable map)
engineList.value = engineList.value.map(item => ({
  ...item,
  status: item.fileName === engine.fileName ? 'running' : item.status
}))

// 3. Modal confirm wrapper for destructive ops
return new Promise<void>((resolve, reject) => {
  Modal.confirm({
    title: 'Delete X',
    onOk: async () => { try { /* IPC call */; resolve() } catch(e) { reject(e) } }
  })
})

// 4. Type guard for runtime events
const isRunState = (s: string): s is 'idle'|'running'|'paused'|'completed'|'stopped'|'error' => (
  s === 'idle' || s === 'running' || ...
)

// 5. Structured Clone compliance before IPC
const safeFlow = JSON.parse(JSON.stringify(flow))
await ipc.invoke(ipcApiRoute.saveAutoFlow, { flow: safeFlow })

// 6. Load-reload pattern after mutations
await loadFileTree() // or loadEngineConfigs(), loadAutoReplyScripts()
```

## ANTI-PATTERNS

- ❌ Directly mutating ref items: `engineList.value[0].status = 'running'` → use map spread pattern
- ❌ Skipping IPC guard: `await ipc.invoke(...)` → always check `if (!ipc)` first
- ❌ Passing Vue proxies to IPC: `ipc.invoke('save', { flow })` → `JSON.parse(JSON.stringify(flow))` first
- ❌ Duplicated validation logic: validate in composable, keep UI components clean
- ❌ Hardcoded success messages: use Message from `@arco-design/web-vue` consistently
- ❌ Recursive tree mutation without returning: `removeNodeFromTree()` returns new tree for React update
