<template>
  <a-modal
    :visible="visible"
    title="Add Folder"
    :mask-closable="false"
    ok-text="OK"
    cancel-text="Cancel"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-input v-model="folderName" placeholder="Enter folder name" @press-enter="handleOk" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

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
