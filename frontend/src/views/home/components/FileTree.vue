<template>
  <div class="file-tree-section">
    <div class="header">
      <span class="title">File Tree</span>
    </div>
    <div class="tree-container">
      <a-input-search style="margin-bottom: 8px; width: 100%" v-model="searchKey" placeholder="Search files..."
        allow-clear />
      <a-tree :data="filteredTreeData" :default-expand-all="true" block-node show-line
        :field-names="{ key: 'key', title: 'title', children: 'children' }">
        <template #title="node">
          <span class="tree-node-title" v-html="highlightText(node.title, searchKey)"></span>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TreeNodeData } from '@arco-design/web-vue';

const props = defineProps<{
  treeData: Array<TreeNodeData>;
}>();

const searchKey = ref('');

// 高亮显示搜索关键词
const highlightText = (text: string, keyword: string): string => {
  if (!keyword) return text;
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

// 转义正则表达式特殊字符
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 过滤树数据，保留匹配的节点及其父节点
const filterTreeData = (data: TreeNodeData[], keyword: string): TreeNodeData[] => {
  if (!keyword) return data;

  const lowerKeyword = keyword.toLowerCase();

  return data
    .map(node => {
      // 检查当前节点是否匹配
      const isMatch = node.title?.toLowerCase().includes(lowerKeyword);

      // 递归过滤子节点
      const filteredChildren = node.children
        ? filterTreeData(node.children, keyword)
        : [];

      // 如果当前节点匹配，或者有匹配的子节点，则保留该节点
      if (isMatch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        };
      }

      return null;
    })
    .filter((node): node is TreeNodeData => node !== null);
};

// 计算过滤后的树数据
const filteredTreeData = computed(() => {
  return filterTreeData(props.treeData, searchKey.value);
});
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

  :deep(.highlight) {
    background-color: var(--color-warning-light-1);
    color: var(--color-warning-6);
    font-weight: 600;
    padding: 0 2px;
    border-radius: 2px;
  }
}
</style>
