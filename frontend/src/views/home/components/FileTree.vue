<template>
  <div class="file-tree-section">
    <div class="header">
      <span class="title">File Tree</span>
    </div>
    <div class="tree-container">
      <a-input-search style="margin-bottom: 8px; width: 100%" v-model="searchKey" />
      <a-tree :data="treeData" :default-expand-all="true" block-node show-line>
        <template #title="node">
          <span class="tree-node-title">{{ node.title }}</span>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TreeNodeData } from '@arco-design/web-vue';

defineProps<{
  treeData: Array<TreeNodeData>;
}>();
</script>

<style scoped lang="less">
.file-tree-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-2);
}

.header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);

  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}

.tree-container {
  flex: 1;
  overflow: auto;
  padding: 8px;

  :deep(.arco-tree-node) {
    line-height: 28px;
  }

  :deep(.arco-tree-node-title-text) {
    font-size: 13px;
  }
}
</style>
