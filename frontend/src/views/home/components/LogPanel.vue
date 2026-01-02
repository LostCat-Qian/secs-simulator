<template>
  <div class="log-section">
    <!-- Header -->
    <div class="header">
      <span class="title" :title="title">{{ title }}</span>
      <div class="actions">
        <a-button size="mini" type="text" @click="$emit('clear')">
          <template #icon><icon-refresh /></template>
        </a-button>
        <a-button size="mini" type="text" @click="$emit('close')">
          <template #icon><icon-close /></template>
        </a-button>
      </div>
    </div>

    <!-- Log Content -->
    <div class="log-container">
      <div v-for="(log, index) in logs" :key="index" class="log-item">
        <span class="log-time">{{ log.time }}</span>
        <span :class="['log-level', `level-${log.level.toLowerCase()}`]">[{{ log.level }}]</span>
        <span class="log-message">{{ log.message }}</span>
      </div>

      <!-- Empty State -->
      <div v-if="logs.length === 0" class="empty-log">
        No logs available
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconRefresh, IconClose } from '@arco-design/web-vue/es/icon';
import type { LogEntry } from '../types';

defineProps<{
  title?: string;
  logs: LogEntry[];
}>();

defineEmits<{
  (e: 'clear'): void;
  (e: 'close'): void;
}>();
</script>

<style scoped lang="less">
.log-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-2);

  :deep(.actions .arco-btn) {
    padding: 0 4px;
    height: 24px;
    min-width: 24px;
    font-size: 12px;
    color: var(--color-text-2);

    &:hover {
      color: var(--color-text-1);
      background-color: var(--color-fill-3);
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid var(--color-border);
  gap: 8px;
  background-color: var(--color-bg-2);

  .title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
}

.log-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background-color: #1e1e1e;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 4px;
  line-height: 1.4;
  word-break: break-all;
}

.log-time {
  color: #888;
  margin-right: 8px;
}

.log-level {
  font-weight: bold;
  margin-right: 8px;

  &.level-info {
    color: #00b42a;
  }
  &.level-warn {
    color: #ff7d00;
  }
  &.level-error {
    color: #f53f3f;
  }
  &.level-debug {
    color: #165dff;
  }
}

.log-message {
  color: #d9d9d9;
}

.empty-log {
  color: #666;
  text-align: center;
  padding-top: 20px;
  font-style: italic;
}
</style>
