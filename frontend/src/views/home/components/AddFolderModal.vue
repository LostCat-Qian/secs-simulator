<template>
  <a-modal :visible="visible" :title="t('modal.addFolder')" :mask-closable="false" :ok-text="t('common.confirm')" :cancel-text="t('common.cancel')" @ok="handleOk"
    @cancel="handleCancel">
    <a-input v-model="folderName" :placeholder="t('fileTree.folderNamePlaceholder')" @press-enter="handleOk" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'submit', folderName: string): void;
}>();

const folderName = ref('');

watch(
  () => props.visible,
  (val) => {
    if (val) {
      folderName.value = '';
    }
  }
);

const handleOk = () => {
  emit('submit', folderName.value);
};

const handleCancel = () => {
  emit('update:visible', false);
};
</script>
