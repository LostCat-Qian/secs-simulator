<template>
  <a-modal :visible="visible" @update:visible="val => $emit('update:visible', val)" :title="modalTitle" width="90vw"
    :footer="true" @cancel="handleCancel" :mask-closable="false" :body-style="{ padding: 0, height: '70vh' }">
    <div class="editor-container" tabindex="0">
      <vue-monaco-editor v-model:value="editorContent" :language="language" :theme="theme" :options="editorOptions" />
    </div>

    <template #footer>
      <div class="footer-actions">
        <div class="status-info">
          <span class="file-info">{{ fileName }}</span>
          <span v-if="isModified" class="modified-indicator">Modified</span>
        </div>
        <div class="button-group">
          <a-button @click="handleCancel">Cancel</a-button>
          <a-button type="primary" @click="handleSave" :disabled="!isModified">Save</a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';

const props = defineProps<{
  visible: boolean;
  fileName?: string;
  initialContent?: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'save', content: string): void;
}>();

// Editor state
const editorContent = ref('');
const originalContent = ref('');

// Editor configuration
const theme = ref('vs-dark');
// All files use shell format for parsing (provides better highlighting for log files)
const language = ref('shell');

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
  trimAutoWhitespace: true,
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  folding: true,
  foldingStrategy: 'auto',
  showFoldingControls: 'always',
  matchBrackets: 'always',
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  autoIndent: 'advanced',
  bracketPairColorization: {
    enabled: true
  },
  // Enable clipboard support
  domReadOnly: false,
  readOnly: false,
  // Ensure keyboard events are captured
  contextmenu: true,
  // Accessibility support for clipboard
  accessibilitySupport: 'auto' as const,
  // Enable all clipboard operations
  clipboard: true,
  // Allow focus
  enableDropOperations: true
};

const modalTitle = computed(() => `Edit: ${props.fileName || 'Untitled'}`);

// Track modification state
const isModified = computed(() => editorContent.value !== originalContent.value);

/**
 * Watch for visibility changes to load content.
 */
watch(() => props.visible, (val) => {
  if (val) {
    editorContent.value = props.initialContent || '';
    originalContent.value = props.initialContent || '';
  }
});

/**
 * Handle cancel action.
 */
const handleCancel = () => {
  if (isModified.value) {
    // In a real app, you might want to show a confirmation dialog
    // For now, we'll just close
  }
  emit('update:visible', false);
};

/**
 * Handle save action.
 */
const handleSave = () => {
  emit('save', editorContent.value);
  emit('update:visible', false);
};
</script>

<style scoped lang="less">
.editor-container {
  height: 70vh;
  width: 100%;
  outline: none;

  &:focus {
    outline: none;
  }
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;

  .status-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .file-info {
      font-size: 13px;
      color: var(--color-text-2);
    }

    .modified-indicator {
      font-size: 12px;
      color: rgb(var(--warning-6));
      background-color: rgb(var(--warning-1));
      padding: 2px 8px;
      border-radius: var(--border-radius-small);
      font-weight: 500;
    }
  }

  .button-group {
    display: flex;
    gap: 8px;
  }
}
</style>