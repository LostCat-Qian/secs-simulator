<template>
  <div class="engine-section">
    <!-- Header -->
    <div class="header">
      <span class="title">Engines</span>
      <a-button type="primary" size="mini" @click="$emit('add')">
        <template #icon><icon-plus /></template>
        Add
      </a-button>
    </div>

    <!-- Engine List -->
    <div class="list-container">
      <div
        v-for="(item, index) in engines"
        :key="index"
        :class="['engine-item', { active: item.active }]"
        @click="$emit('select', item)"
      >
        <div class="engine-icon">
          <icon-folder />
        </div>
        <div class="engine-info">
          <div class="engine-name" :title="item.name">{{ item.name }}</div>
          <div v-if="item.active" class="engine-status">
            <span class="status-dot"></span>
            <span class="status-text">ACTIVE</span>
          </div>
        </div>

        <!-- Action Menu -->
        <a-dropdown @select="(value: string | number | Record<string, any>) => handleMenuSelect(value, item)" :popup-max-height="false">
          <a-button size="mini" class="action-btn" @click.stop>
            Options <icon-down />
          </a-button>
          <template #content>
            <a-doption value="open"><icon-apps /> Open</a-doption>
            <a-doption value="viewConfig"><icon-settings /> View Config</a-doption>
            <a-doption value="edit"><icon-edit /> Edit Config</a-doption>
            <a-doption value="delete"><icon-delete /> Delete</a-doption>
          </template>
        </a-dropdown>
      </div>

      <!-- Empty State -->
      <div v-if="engines.length === 0" class="empty-state">
        <a-empty description="No engines found" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconFolder, IconEdit, IconDelete, IconApps, IconSettings, IconDown } from '@arco-design/web-vue/es/icon';
import type { EngineData } from '../types';

defineProps<{
  engines: EngineData[];
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'select', engine: EngineData): void;
  (e: 'open', engine: EngineData): void;
  (e: 'edit', engine: EngineData): void;
  (e: 'delete', engine: EngineData): void;
  (e: 'viewConfig', engine: EngineData): void;
}>();

/**
 * Handles dropdown menu selection for a specific engine.
 * @param value The action key selected (e.g., 'open', 'edit')
 * @param item The engine item
 */
const handleMenuSelect = (value: string | number | Record<string, any>, item: EngineData) => {
  const action = String(value);
  switch (action) {
    case 'open':
      emit('open', item);
      break;
    case 'viewConfig':
      emit('viewConfig', item);
      break;
    case 'edit':
      emit('edit', item);
      break;
    case 'delete':
      emit('delete', item);
      break;
  }
};
</script>

<style scoped lang="less">
.engine-section {
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
}

.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.engine-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: var(--color-fill-2);

  &:hover {
    background-color: var(--color-fill-3);
  }

  &.active {
    background-color: rgba(var(--primary-6), 0.1);
    border: 1px solid rgba(var(--primary-6), 0.3);

    .engine-icon {
      color: rgb(var(--primary-6));
    }
  }
}

.engine-icon {
  font-size: 20px;
  margin-right: 12px;
  color: var(--color-text-3);
}

.engine-info {
  flex: 1;
  min-width: 0;
  margin-right: 8px;

  .engine-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .engine-status {
    display: flex;
    align-items: center;
    margin-top: 4px;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #00b42a;
      margin-right: 6px;
    }

    .status-text {
      font-size: 12px;
      color: #00b42a;
    }
  }
}

.action-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.engine-item:hover .action-btn {
  opacity: 1;
}

.empty-state {
  padding: 24px 0;
  display: flex;
  justify-content: center;
}
</style>
