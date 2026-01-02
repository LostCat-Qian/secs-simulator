<template>
  <a-modal :visible="visible" :title="isEditMode ? 'Edit Auto Reply Script' : 'Add Auto Reply Script'"
    :mask-closable="false" width="80vw" ok-text="Save" cancel-text="Cancel" @ok="handleOk" @cancel="handleCancel">
    <a-form layout="vertical" :model="form">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Handle SF" field="handlerSf">
            <a-input v-model="form.handlerSf" placeholder="S7F25" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Tool" field="tool">
            <a-select v-model="form.tool" placeholder="Select tool">
              <a-option v-for="engine in engines" :key="engine.name" :value="engine.name">
                {{ engine.name }}
              </a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Active" field="active">
            <a-switch v-model="form.active" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Delay Time (s)" field="delaySeconds">
            <a-input-number v-model="form.delaySeconds" :min="0" :step="1" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-form-item label="Script">
        <div class="auto-reply-editor-wrapper">
          <vue-monaco-editor v-model:value="form.script" language="javascript" theme="vs-dark"
            :options="editorOptions" />
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { VueMonacoEditor } from '@guolao/vue-monaco-editor';
import type { AutoReplyFormData, EngineData } from '../types';

const props = defineProps<{
  visible: boolean;
  initialData: AutoReplyFormData | null;
  engines: EngineData[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'submit', data: AutoReplyFormData): void;
}>();

const defaultAutoReplyScript = `function handler(msg, dir) {\n  return dir[0];\n}\n`;

const form = ref<AutoReplyFormData>({
  tool: '',
  handlerSf: '',
  active: true,
  delaySeconds: 0,
  script: defaultAutoReplyScript
});

const isEditMode = computed(() => !!props.initialData?.handlerSf); // Heuristic for edit mode, or pass it as prop if needed

const editorOptions = {
  automaticLayout: true,
  minimap: { enabled: true },
  fontSize: 14,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  wordWrap: 'on'
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.initialData) {
        form.value = { ...props.initialData };
      } else {
        // Reset form for new entry
        form.value = {
          tool: props.engines[0]?.name || '',
          handlerSf: '',
          active: true,
          delaySeconds: 0,
          script: defaultAutoReplyScript
        };
      }
    }
  }
);

const handleOk = () => {
  emit('submit', form.value);
};

const handleCancel = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.auto-reply-editor-wrapper {
  height: 380px;
  border: 1px solid var(--color-border);
  width: 100%;
}

.auto-reply-editor-wrapper :deep(.monaco-editor),
.auto-reply-editor-wrapper :deep(.monaco-editor .monaco-editor-background),
.auto-reply-editor-wrapper :deep(.monaco-editor .overflow-guard) {
  width: 100%;
  height: 100%;
}
</style>
