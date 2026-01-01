<template>
  <div class="auto-reply-section">
    <!-- Header -->
    <div class="header">
      <span class="title">Auto Reply Setting</span>
      <div class="actions">
        <a-input-search
          :model-value="searchText"
          @update:model-value="(val: string) => $emit('update:searchText', val)"
          placeholder="Search..."
          size="small"
          style="width: 200px"
        />
        <a-button type="primary" size="small" @click="$emit('add')">
          <template #icon><icon-plus /></template>
          Add
        </a-button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <a-table
        :data="data"
        :pagination="false"
        :bordered="false"
        stripe
        size="small"
        :row-class="rowClass"
        :scroll="{ y: '100%' }"
        style="height: 100%"
      >
        <template #columns>
          <a-table-column title="Tool" data-index="tool" :width="100" />
          <a-table-column title="Handler SF Name" data-index="handlerSfName" :width="150" />
          <a-table-column title="ID (201, 0~1)" data-index="id" :width="150" />
          <a-table-column title="Reply SF Name" data-index="replySfName" :width="150" />
          <a-table-column title="Delay Time" data-index="delayTime" :width="120" />
          <a-table-column title="Status" data-index="status" :width="120">
            <template #cell="{ record }">
              <a-tag :color="getStatusColor(record.status)" size="small">
                {{ record.status }}
              </a-tag>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus } from '@arco-design/web-vue/es/icon';

/**
 * Interface for Auto Reply Item
 */
interface AutoReplyItem {
  tool: string;
  handlerSfName: string;
  id: string;
  replySfName: string;
  delayTime: string;
  status: string;
}

defineProps<{
  data: AutoReplyItem[];
  searchText: string;
}>();

defineEmits<{
  (e: 'add'): void;
  (e: 'update:searchText', value: string): void;
}>();

/**
 * Returns the color associated with the status.
 * @param status The status string
 */
const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    'Active': 'green',
    'Standby': 'gray',
    'Listening': 'cyan',
  };
  return map[status] || 'gray';
};

/**
 * Custom row class for styling specific rows (e.g., highlighting the first row).
 */
const rowClass = (_record: any, rowIndex: number) => {
  // Example: Highlight the first row
  return rowIndex === 0 ? 'highlight-row' : '';
};
</script>

<style scoped lang="less">
.auto-reply-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-2);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);

  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}

.table-container {
  flex: 1;
  padding: 12px;
  overflow: hidden;

  /* Highlight Row Style */
  :deep(.highlight-row) .arco-table-td {
    background-color: var(--color-primary-light-1);
  }
}
</style>
