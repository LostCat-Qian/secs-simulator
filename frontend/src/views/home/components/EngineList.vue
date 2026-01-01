<template>
  <div class="engine-section">
    <div class="header">
      <span class="title">Engines</span>
      <a-button type="primary" size="mini" @click="$emit('add')">
        <template #icon><icon-plus /></template>
        Add
      </a-button>
    </div>
    <div class="list-container">
      <div v-for="(item, index) in engines" :key="index" :class="['engine-item', { active: item.active }]"
        @click="$emit('select', item)">
        <div class="engine-icon">
          <icon-folder />
        </div>
        <div class="engine-info">
          <div class="engine-name">{{ item.name }}</div>
          <div v-if="item.active" class="engine-status">
            <span class="status-dot"></span>
            <span class="status-text">ACTIVE</span>
          </div>
        </div>
        <a-dropdown @select="handleMenuSelect" :popup-max-height="false">
          <a-button size="mini">Options<icon-down /></a-button>
          <template #content>
            <a-doption @click="handleMenuSelect('open', item)"> <icon-apps /> Open</a-doption>
            <a-doption @click="handleMenuSelect('viewConfig', item)"> <icon-settings /> View Config</a-doption>
            <a-doption @click="handleMenuSelect('edit', item)"> <icon-edit /> EditConfig</a-doption>
            <a-doption @click="handleMenuSelect('delete', item)"> <icon-delete /> Delete</a-doption>
          </template>
        </a-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPlus, IconFolder, IconEdit, IconDelete, IconApps, IconSettings, IconDown } from '@arco-design/web-vue/es/icon';

defineProps<{
  engines: Array<{
    name: string;
    active: boolean;
  }>;
}>();

const emit = defineEmits(['add', 'select', 'open', 'edit', 'delete', 'viewConfig']);

const handleMenuSelect = (value: any, item: any) => {
  emit(value, item);
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

.engine-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 4px;
  border-radius: var(--border-radius-small);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--color-text-2);

  &:hover {
    background-color: var(--color-fill-2);
  }

  &.active {
    background-color: var(--color-primary-light-1);
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
  }

  .engine-info {
    flex: 1;
    min-width: 0;

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
    flex-shrink: 0;
    margin-left: 8px;
  }
}
</style>
