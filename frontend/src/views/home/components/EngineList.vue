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
      <div v-for="(item, index) in engines" :key="index" :class="['engine-item', { active: item.active }]"
        @click="$emit('select', item)">
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
        <a-dropdown @select="(value: string) => handleMenuSelect(value, item)" :popup-max-height="false">
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

/**
 * Interface for Engine Data
 */
interface Engine {
  name: string;
  active: boolean;
  // Add other properties if needed
}

const props = defineProps<{
  engines: Engine[];
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'select', engine: Engine): void;
  (e: 'open', engine: Engine): void;
  (e: 'edit', engine: Engine): void;
  (e: 'delete', engine: Engine): void;
  (e: 'viewConfig', engine: Engine): void;
}>();

/**
 * Handles dropdown menu selection for a specific engine.
 * @param value The action key selected (e.g., 'open', 'edit')
 * @param item The engine item
 */
const handleMenuSelect = (value: string | number | Record<string, any>, item: Engine) => {
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
  padding: 8px 12px;
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

.empty-state {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

.engine-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-2);
  border: 1px solid transparent;

  &:hover {
    background-color: var(--color-fill-2);
  }

  &.active {
    background-color: var(--color-primary-light-1);
    border-color: var(--color-primary-light-2);
    color: var(--color-primary-6);

    .engine-icon {
      color: var(--color-primary-6);
      background-color: var(--color-primary-light-2);
    }
  }

  .engine-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-fill-2);
    border-radius: var(--border-radius-small);
    margin-right: 12px;
    font-size: 16px;
    transition: all 0.2s;
    color: var(--color-text-3);
  }

  .engine-info {
    flex: 1;
    min-width: 0;
    margin-right: 8px;

    .engine-name {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .engine-status {
      display: flex;
      align-items: center;
      margin-top: 2px;

      .status-dot {
        width: 6px;
        height: 6px;
        background-color: rgb(var(--success-6));
        border-radius: 50%;
        margin-right: 4px;
      }

      .status-text {
        font-size: 10px;
        color: rgb(var(--success-6));
        font-weight: 600;
      }
    }
  }

  .action-btn {
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }

  &:hover .action-btn,
  &:focus-within .action-btn {
    opacity: 1;
  }
}
</style>
