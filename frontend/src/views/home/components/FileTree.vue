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
          <div class="tree-node-content">
            <span class="tree-node-title" v-html="highlightText(node.title, searchKey)"></span>
            <!-- 只为文件节点（非文件夹）显示下拉菜单 -->
            <a-dropdown v-if="!node.isFolder" @select="(value: string) => handleMenuSelect(value, node)" trigger="click"
              :popup-max-height="false">
              <a-button size="mini" class="menu-btn" @mousedown.stop>
                <template #icon><icon-more /></template>
              </a-button>
              <template #content>
                <a-doption value="edit">
                  <template #icon><icon-edit /></template>
                  Edit
                </a-doption>
                <a-doption value="delete">
                  <template #icon><icon-delete /></template>
                  Delete
                </a-doption>
                <a-dsubmenu value="sendto">
                  <template #icon><icon-export /></template>
                  Send To
                  <template #content>
                    <a-doption v-for="engine in engines" :key="engine.name" :value="`sendto-${engine.name}`">
                      <template #icon><icon-send /></template>
                      {{ engine.name }}
                    </a-doption>
                    <a-doption v-if="engines.length === 0" disabled>
                      <template #icon><icon-close-circle /></template>
                      No Engines Available
                    </a-doption>
                  </template>
                </a-dsubmenu>
              </template>
            </a-dropdown>
          </div>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TreeNodeData, Message } from '@arco-design/web-vue';
import { IconMore, IconEdit, IconDelete, IconExport, IconSend, IconCloseCircle } from '@arco-design/web-vue/es/icon';

const props = defineProps<{
  treeData: Array<TreeNodeData>;
  engines: Array<{ name: string; active: boolean }>;
}>();

const emit = defineEmits(['edit', 'delete', 'sendTo']);

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

// 处理菜单选择
const handleMenuSelect = (value: string, node: TreeNodeData) => {
  if (value === 'edit') {
    emit('edit', node);
  } else if (value === 'delete') {
    emit('delete', node);
  } else if (value.startsWith('sendto-')) {
    const engineName = value.replace('sendto-', '');
    emit('sendTo', { file: node, engineName });
  }
};
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

  .tree-node-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 8px;

    .tree-node-title {
      flex: 1;
      min-width: 0;
    }

    .menu-btn {
      opacity: 0;
      transition: opacity 0.2s;
      padding: 0 8px;
      height: 24px;
      font-size: 12px;
      border-radius: var(--border-radius-small);

      &:hover {
        color: var(--color-primary-6);
        border-color: var(--color-primary-6);
      }
    }
  }

  :deep(.arco-tree-node:hover) .menu-btn {
    opacity: 1;
  }
}
</style>
