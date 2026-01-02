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
        size="small"
        :scroll="{ y: '100%' }"
        style="height: 100%"
      >
        <template #columns>
          <a-table-column title="Tool" data-index="tool" :width="100" />
          <a-table-column title="SF Name" data-index="sf" :width="120" />
          <a-table-column title="Delay (s)" data-index="delaySeconds" :width="120" />
          <a-table-column title="Active" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'gray'" size="small">
                {{ record.active ? 'true' : 'false' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column title="Actions" :width="180">
            <template #cell="{ record }">
              <a-button type="text" size="small" @click="$emit('edit', record)">
                Edit
              </a-button>
              <a-button type="text" status="danger" size="small" @click="$emit('delete', record)">
                Delete
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus } from '@arco-design/web-vue/es/icon';

interface AutoReplyItem {
  name: string;
  tool: string;
  sf: string;
  delaySeconds: number;
  active: boolean;
}

defineProps<{
  data: AutoReplyItem[];
  searchText: string;
}>();

defineEmits<{
  (e: 'add'): void;
  (e: 'update:searchText', value: string): void;
  (e: 'edit', value: AutoReplyItem): void;
  (e: 'delete', value: AutoReplyItem): void;
}>();

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
