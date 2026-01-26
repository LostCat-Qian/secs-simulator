<template>
  <a-modal :visible="visible" @update:visible="val => $emit('update:visible', val)" :title="modalTitle" width="90vw"
    :footer="true" @cancel="handleCancel" :mask-closable="false" :body-style="{ padding: 0, height: '70vh' }">
    <div class="editor-container" tabindex="0">
      <vue-monaco-editor v-model:value="editorContent" :language="language" :theme="theme" :options="editorOptions" />
    </div>

    <template #footer>
      <div class="footer-actions">
        <div class="status-info">
          <span class="file-info">
            <a-input v-if="editableName" v-model="localFileName" size="small" placeholder="请输入文件名" />
            <span v-else>{{ fileName }}</span>
          </span>
          <span v-if="isModified" class="modified-indicator">Modified</span>
        </div>
        <div class="button-group">
          <a-button @click="handleCancel">Cancel</a-button>
          <a-button type="primary" @click="handleSave" :disabled="!canSave">Save</a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const props = defineProps<{
  visible: boolean;
  fileName?: string;
  initialContent?: string;
  editableName?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'save', payload: { name: string; content: string }): void;
}>();

const editorContent = ref('');
const originalContent = ref('');
const localFileName = ref('');

const theme = ref('vs-dark');
const language = ref('shell');

const editorOptions = {
  automaticLayout: true,
  minimap: { enabled: true },
  fontSize: 16,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  tabSize: 4,
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
  domReadOnly: false,
  readOnly: false,
  contextmenu: true,
  accessibilitySupport: 'auto' as const,
  clipboard: true,
  enableDropOperations: true
};

const modalTitle = computed(() => `${t('fileEditor.editTitle')} ${props.fileName || t('fileEditor.untitled')}`);

const isModified = computed(() => editorContent.value !== originalContent.value);

const canSave = computed(() => {
  if (props.editableName) {
    return !!localFileName.value.trim();
  }
  return isModified.value;
});

watch(() => props.visible, (val) => {
  if (val) {
    editorContent.value = props.initialContent || '';
    originalContent.value = props.initialContent || '';
    localFileName.value = props.fileName || '';
  }
});

const handleCancel = () => {
  emit('update:visible', false);
};

const handleSave = () => {
  const name = props.editableName ? localFileName.value.trim() : (props.fileName || '');
  emit('save', {
    name,
    content: editorContent.value
  });
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
