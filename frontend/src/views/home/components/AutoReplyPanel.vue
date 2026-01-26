<template>
  <div class="auto-reply-section">
    <!-- Header -->
    <div class="header">
      <span class="title">{{ t('autoReply.title') }}</span>
      <div class="actions">
        <a-input-search :model-value="searchText" @update:model-value="(val: string) => $emit('update:searchText', val)"
          :placeholder="t('common.search')" size="small" style="width: 200px" />
        <a-button type="secondary" size="small" @click="$emit('refresh')">
          <template #icon><icon-refresh /></template>
        </a-button>
        <a-button type="primary" size="small" @click="$emit('add')">
          <template #icon><icon-plus /></template>
          {{ t('common.add') }}
        </a-button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <a-table :data="data" column-resizable :pagination="false" :bordered="{ cell: true }" size="small"
        :scroll="{ y: '100%' }" style="height: 100%">
        <template #columns>
          <a-table-column :title="t('autoReply.tool')" data-index="tool" :width="100" />
          <a-table-column :title="t('autoReply.handlerSf')" data-index="sf" :width="120" />
          <a-table-column :title="t('autoReply.delaySeconds')" data-index="delaySeconds" :width="120" />
          <a-table-column :title="t('autoReply.active')" :width="120">
            <template #cell="{ record }">
              <a-tag :color="record.active ? 'green' : 'gray'" size="small">
                {{ record.active ? 'true' : 'false' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column :title="t('autoReply.actions')" :width="180">
            <template #cell="{ record }">
              <a-button type="dashed" status="normal" size="small" @click="$emit('edit', record)">
                {{ t('common.edit') }}
              </a-button>
              &nbsp;
              <a-button type="dashed" status="danger" size="small" @click="$emit('delete', record)">
                {{ t('common.delete') }}
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon';
import type { AutoReplyItem } from '../types';

const { t } = useI18n()

defineProps<{
  data: AutoReplyItem[];
  searchText: string;
}>();

defineEmits<{
  (e: 'add'): void;
  (e: 'update:searchText', value: string): void;
  (e: 'edit', value: AutoReplyItem): void;
  (e: 'delete', value: AutoReplyItem): void;
  (e: 'refresh'): void;
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
  overflow: hidden;
}
</style>
