<template>
  <a-modal
    :visible="visible"
    @update:visible="(val) => $emit('update:visible', val)"
    title="EventBind Configuration"
    width="85vw"
    :footer="true"
    @cancel="handleCancel"
    :mask-closable="false"
    :body-style="{ padding: '16px', height: '80vh', display: 'flex', flexDirection: 'column' }"
  >
    <div class="event-bind-container">
      <!-- Editor Section -->
      <div class="editor-section">
        <div class="section-header">
          <span class="section-title">TOML Configuration</span>
        </div>
        <div class="editor-wrapper" :class="{ 'has-error': validationError }">
          <vue-monaco-editor
            v-model:value="tomlContent"
            language="toml"
            :theme="'toml-dark'"
            :options="editorOptions"
          />
        </div>
        <div v-if="validationError" class="error-message">
          <icon-exclamation-circle-fill />
          {{ validationError }}
        </div>
      </div>

      <!-- Preview Section -->
      <div class="preview-section">
        <div class="section-header">
          <span class="section-title">Generated SML Preview</span>
        </div>
        <div class="preview-tabs" v-if="previewType === 'all'">
          <div
            class="preview-tab"
            :class="{ active: activePreviewTab === 's2f37DisableAllEvents' }"
            @click="activePreviewTab = 's2f37DisableAllEvents'"
          >
            01: Disable All Events
          </div>
          <div
            class="preview-tab"
            :class="{ active: activePreviewTab === 's2f35DisableLink' }"
            @click="activePreviewTab = 's2f35DisableLink'"
          >
            02: Disable Link
          </div>
          <div
            class="preview-tab"
            :class="{ active: activePreviewTab === 's2f33DisableReport' }"
            @click="activePreviewTab = 's2f33DisableReport'"
          >
            03: Disable Report
          </div>
          <div
            class="preview-tab"
            :class="{ active: activePreviewTab === 's2f33DefineReport' }"
            @click="activePreviewTab = 's2f33DefineReport'"
          >
            04: Define Report
          </div>
          <div
            class="preview-tab"
            :class="{ active: activePreviewTab === 's2f35EnableLinkEvent' }"
            @click="activePreviewTab = 's2f35EnableLinkEvent'"
          >
            05: Enable Link
          </div>
          <div
            class="preview-tab"
            :class="{ active: activePreviewTab === 's2f37EnableAllEvents' }"
            @click="activePreviewTab = 's2f37EnableAllEvents'"
          >
            06: Enable All Events
          </div>
        </div>
        <div class="preview-content">
          <vue-monaco-editor
            v-model:value="previewContent"
            language="shell"
            :theme="'vs-dark'"
            :options="previewOptions"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer-actions">
        <div class="status-info">
          <span v-if="generatedFiles" class="file-count">
            <icon-file />
            <template v-if="previewType === 'all'">
              Will generate: 6 files (Disable/Enable S2F37, S2F35, S2F33)
            </template>
            <template v-else> Will generate: All 6 EventBind files </template>
          </span>
          <span v-if="savePath" class="save-path">
            <icon-folder />
            EventBind_{{ savePath }}
          </span>
        </div>
        <div class="button-group">
          <a-button @click="handleCancel">
            <template #icon>
              <icon-close-circle />
            </template>
            <template #default>Cancel</template>
          </a-button>
          <a-button :disabled="!canConvert" @click="handleConvert" :loading="converting">
            <template #icon>
              <icon-swap />
            </template>
            <template #default>Convert</template>
          </a-button>
          <a-button type="primary" @click="handleSave" :disabled="!canSave" :loading="saving">
            <template #icon>
              <icon-save />
            </template>
            <template #default>Save</template>
          </a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import {
  IconCloseCircle,
  IconFile,
  IconFolder,
  IconSave,
  IconSwap,
  IconExclamationCircleFill
} from '@arco-design/web-vue/es/icon'
import { validateDefineLinkToml, DEFAULT_DEFINE_LINK_TEMPLATE } from '@/utils/smlGenerator'
import { useEventBind } from '../composables/useEventBind'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'save', payload: { folderPath: string; files: { name: string; content: string }[] }): void
}>()

const { generateEventBindFiles: generateEventBindApi } = useEventBind()

// Editor content
const tomlContent = ref(DEFAULT_DEFINE_LINK_TEMPLATE)
const originalContent = ref(DEFAULT_DEFINE_LINK_TEMPLATE)

// Preview state
const previewType = ref<'s2f37' | 's2f35' | 's2f33' | 'all'>('all')
const activePreviewTab = ref<
  | 's2f37DisableAllEvents'
  | 's2f35DisableLink'
  | 's2f33DisableReport'
  | 's2f33DefineReport'
  | 's2f35EnableLinkEvent'
  | 's2f37EnableAllEvents'
>('s2f33DefineReport')
const previewContent = ref('')

// Validation
const validationError = ref('')

// Generated files
const generatedFiles = ref<
  | {
      s2f37DisableAllEvents: string
      s2f35DisableLink: string
      s2f33DisableReport: string
      s2f33DefineReport: string
      s2f35EnableLinkEvent: string
      s2f37EnableAllEvents: string
    }
  | null
  | undefined
>(null)
const savePath = ref('')

// Loading states
const converting = ref(false)
const saving = ref(false)

// Editor options for TOML
const editorOptions = {
  automaticLayout: true,
  minimap: { enabled: true },
  fontSize: 14,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  tabSize: 2,
  formatOnPaste: true,
  formatOnType: true,
  folding: true,
  foldingStrategy: 'auto',
  showFoldingControls: 'always',
  matchBrackets: 'always',
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  autoIndent: 'advanced',
  bracketPairColorization: { enabled: true },
  readOnly: false,
  contextmenu: true,
  accessibilitySupport: 'auto' as const,
  clipboard: true,
  enableDropOperations: true
}

// Preview editor options (read-only)
const previewOptions = {
  ...editorOptions,
  readOnly: true,
  minimap: { enabled: false },
  fontSize: 13
}

// Computed properties
const canConvert = computed(() => {
  return tomlContent.value.trim().length > 0 && !validationError.value
})

const canSave = computed(() => {
  return generatedFiles.value !== null && !validationError.value
})

// Watch for content changes to update preview
watch(tomlContent, async (content) => {
  if (content !== originalContent.value) {
    validateContent()
    await updatePreview()
  }
})

// Watch for preview tab changes
watch(activePreviewTab, () => {
  updatePreviewContent()
})

// Validate content
function validateContent() {
  const result = validateDefineLinkToml(tomlContent.value)
  if (!result.valid) {
    validationError.value = result.error || 'Validation failed'
  } else {
    validationError.value = ''
  }
}

async function updatePreview() {
  const result = await generateEventBindApi(tomlContent.value)
  generatedFiles.value = result.files || null

  const files = result.files
  if (!files) return

  if (previewType.value === 'all') {
    previewContent.value = files.s2f37EnableAllEvents
    activePreviewTab.value = 's2f37EnableAllEvents'
  } else if (previewType.value === 's2f37') {
    previewContent.value = files.s2f37EnableAllEvents
    activePreviewTab.value = 's2f37EnableAllEvents'
  } else if (previewType.value === 's2f35') {
    previewContent.value = files.s2f35EnableLinkEvent
    activePreviewTab.value = 's2f35EnableLinkEvent'
  } else {
    previewContent.value = files.s2f33DefineReport
    activePreviewTab.value = 's2f33DefineReport'
  }
}

function updatePreviewContent() {
  if (!generatedFiles.value) return

  const tab = activePreviewTab.value
  previewContent.value = generatedFiles.value[tab]
}

async function handleConvert() {
  if (!canConvert.value) return

  converting.value = true
  try {
    const result = await generateEventBindApi(tomlContent.value)
    generatedFiles.value = result.files || null
    savePath.value = generateSavePath()
    updatePreview()
    Message.success('Converted successfully! Preview updated.')
  } catch (error: any) {
    Message.error(`Conversion failed: ${error.message}`)
  } finally {
    converting.value = false
  }
}

// Generate save path
function generateSavePath(): string {
  const now = new Date()
  const timestamp =
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0')
  return `${timestamp}`
}

async function handleSave() {
  if (!generatedFiles.value) {
    Message.warning('Please convert first')
    return
  }

  saving.value = true
  try {
    const timestamp = generateSavePath()
    const folderName = `EventBind_${timestamp}`

    const files = [
      { name: '01_S2F37_DisableAllEvents.txt', content: generatedFiles.value.s2f37DisableAllEvents },
      { name: '02_S2F35_DisableLink.txt', content: generatedFiles.value.s2f35DisableLink },
      { name: '03_S2F33_DisableReport.txt', content: generatedFiles.value.s2f33DisableReport },
      { name: '04_S2F33_DefineReport.txt', content: generatedFiles.value.s2f33DefineReport },
      { name: '05_S2F35_EnableLinkEvent.txt', content: generatedFiles.value.s2f35EnableLinkEvent },
      { name: '06_S2F37_EnableAllEvents.txt', content: generatedFiles.value.s2f37EnableAllEvents }
    ]

    emit('save', {
      folderPath: folderName,
      files
    })
  } catch (error: any) {
    Message.error(`Save failed: ${error.message}`)
  } finally {
    saving.value = false
  }
}

// Handle cancel
function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped lang="less">
.event-bind-container {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.editor-section,
.preview-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;

  &.has-error {
    border: 1px solid rgb(var(--danger-6));
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgb(var(--danger-1));
  color: rgb(var(--danger-6));
  font-size: 12px;
  border-top: 1px solid rgb(var(--danger-3));
}

.preview-tabs {
  display: flex;
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);

  .preview-tab {
    padding: 8px 16px;
    font-size: 12px;
    color: var(--color-text-2);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &:hover {
      color: var(--color-text-1);
      background-color: var(--color-fill-2);
    }

    &.active {
      color: rgb(var(--primary-6));
      border-bottom-color: rgb(var(--primary-6));
      background-color: var(--color-fill-2);
    }
  }
}

.preview-content {
  flex: 1;
  overflow: hidden;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;

  .status-info {
    display: flex;
    align-items: center;
    gap: 16px;

    .file-count,
    .save-path {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--color-text-2);
    }

    .save-path {
      color: rgb(var(--success-6));
    }
  }

  .button-group {
    display: flex;
    gap: 8px;
  }
}
</style>
