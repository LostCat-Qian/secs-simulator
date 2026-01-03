<template>
  <div class="file-tree-section">
    <div class="header">
      <span class="title">File Tree</span>
      <div class="header-actions">
        <a-button size="mini" type="text" @click="emit('addRootFile')">
          <template #icon><icon-plus /></template>
          File
        </a-button>
        <a-button size="mini" type="text" @click="emit('addRootFolder')">
          <template #icon><icon-plus /></template>
          Folder
        </a-button>
      </div>
    </div>

    <!-- Tree Content -->
    <div class="tree-container">
      <!-- Search Input -->
      <a-input-search style="margin-bottom: 8px; width: 100%" v-model="searchKey" placeholder="Search files..."
        allow-clear />

      <!-- Tree View -->
      <a-tree :data="filteredTreeData" :default-expand-all="true" block-node show-line
        :field-names="{ key: 'key', title: 'title', children: 'children' }">
        <template #title="node">
          <div class="tree-node-content" @click.stop="handleNodeClick(node)">
            <!-- Node Title with Highlight -->
            <span class="tree-node-title" v-html="highlightText(node.title, searchKey)"></span>

            <!-- Actions -->
            <a-dropdown trigger="click"
              @select="(value: string | number | Record<string, any>) => handleMenuSelect(String(value), node)"
              :popup-max-height="false">
              <a-button size="mini" class="menu-btn" @mousedown.stop v-if="!node.isFolder">
                <template #icon><icon-more /></template>
              </a-button>
              <!-- Folder Actions -->
              <a-button size="mini" class="menu-btn" @mousedown.stop v-else>
                <template #icon><icon-more /></template>
              </a-button>

              <template #content>
                <template v-if="!node.isFolder">
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
                      <a-doption v-for="engine in openEngines" :key="engine.name" :value="`sendto-${engine.name}`">
                        <template #icon><icon-send /></template>
                        {{ engine.name }}
                      </a-doption>
                      <a-doption v-if="openEngines.length === 0" disabled>
                        <template #icon><icon-close-circle /></template>
                        No Open Engines
                      </a-doption>
                    </template>
                  </a-dsubmenu>
                </template>
                <template v-else>
                  <a-doption value="addFile">
                    <template #icon><icon-plus /></template>
                    Add File
                  </a-doption>
                  <a-doption value="addFolder">
                    <template #icon><icon-plus /></template>
                    Add Folder
                  </a-doption>
                  <a-doption value="delete">
                    <template #icon><icon-delete /></template>
                    Delete Folder
                  </a-doption>
                </template>
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
import { TreeNodeData } from '@arco-design/web-vue';
import { IconMore, IconEdit, IconDelete, IconExport, IconSend, IconCloseCircle, IconPlus } from '@arco-design/web-vue/es/icon';
import type { SmlTreeNode, EngineData } from '../types';

const props = defineProps<{
  treeData: SmlTreeNode[];
  engines: EngineData[];
}>();

const emit = defineEmits<{
  (e: 'edit', node: TreeNodeData): void;
  (e: 'delete', node: TreeNodeData): void;
  (e: 'sendTo', payload: { file: TreeNodeData; engineName: string }): void;
  (e: 'selectFile', node: TreeNodeData): void;
  (e: 'addFile', node: TreeNodeData): void;
  (e: 'addFolder', node: TreeNodeData): void;
  (e: 'addRootFile'): void;
  (e: 'addRootFolder'): void;
}>();

const searchKey = ref('');

const openEngines = computed(() =>
  props.engines.filter(engine => engine.status === 'running' || engine.active)
);

/**
 * Escapes special characters for RegExp.
 * @param string The string to escape
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Highlights keywords in the text.
 * @param text The text to highlight
 * @param keyword The keyword to search for
 */
const highlightText = (text: string, keyword: string): string => {
  if (!keyword) return text;
  const regex = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

/**
 * Filters the tree data based on the keyword.
 * Retains nodes that match the keyword or have children that match.
 * @param data The tree data
 * @param keyword The search keyword
 */
const filterTreeData = (data: SmlTreeNode[], keyword: string): SmlTreeNode[] => {
  if (!keyword) return data;

  const lowerKeyword = keyword.toLowerCase();

  return data
    .map(node => {
      // Check if current node matches
      const isMatch = node.title?.toLowerCase().includes(lowerKeyword);

      // Recursively filter children
      const filteredChildren = node.children
        ? filterTreeData(node.children, keyword)
        : [];

      // Keep node if it matches OR if it has matching children
      if (isMatch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        };
      }

      return null;
    })
    .filter((node): node is SmlTreeNode => node !== null);
};

// Computed property for the filtered tree
const filteredTreeData = computed(() => {
  return filterTreeData(props.treeData, searchKey.value);
});

const handleNodeClick = (node: TreeNodeData) => {
  const smlNode = node as SmlTreeNode;
  if (smlNode.isFolder) {
    return;
  }
  emit('selectFile', node);
};

/**
 * Handles menu selection from the dropdown.
 * @param value The action value
 * @param node The tree node
 */
const handleMenuSelect = (value: string, node: TreeNodeData) => {
  if (value === 'edit') {
    emit('edit', node);
  } else if (value === 'delete') {
    emit('delete', node);
  } else if (value === 'addFile') {
    emit('addFile', node);
  } else if (value === 'addFolder') {
    emit('addFolder', node);
  } else if (value.startsWith('sendto-')) {
    const engineName = value.slice(7);
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

  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.tree-container {
  flex: 1;
  overflow: auto;
  padding: 8px;

  /* Custom Tree Node Styles */
  :deep(.arco-tree-node) {
    line-height: 28px;
  }

  :deep(.arco-tree-node-title-text) {
    font-size: 13px;
  }

  /* Search Highlight Style */
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .menu-btn {
      opacity: 0;
      transition: opacity 0.2s;
      padding: 0 8px;
      height: 24px;
      font-size: 12px;
      border-radius: var(--border-radius-small);
      color: var(--color-text-3);

      &:hover {
        color: var(--color-primary-6);
        background-color: var(--color-fill-2);
      }
    }
  }

  :deep(.arco-tree-node:hover) .menu-btn,
  .menu-btn:focus-within {
    opacity: 1;
  }
}
</style>
