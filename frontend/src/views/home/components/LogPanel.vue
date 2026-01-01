<template>
  <div class="log-section">
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
    <div class="log-container">
      <div v-for="(log, index) in logs" :key="index" class="log-item">
        <span class="log-time">{{ log.time }}</span>
        <span :class="['log-level', `level-${log.level.toLowerCase()}`]">[{{ log.level }}]</span>
        <span class="log-message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconRefresh, IconClose } from '@arco-design/web-vue/es/icon';

defineProps<{
  title?: string;
  logs: Array<{
    time: string;
    level: string;
    message: string;
  }>;
}>();

defineEmits(['clear', 'close']);
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
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid var(--color-border);
  gap: 8px;

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
  overflow: auto;
  padding: 12px 16px;
  background-color: #121212; // Keep dark background for logs as it's standard for terminals
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12px;

  .log-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 4px;
    line-height: 1.5;

    .log-time {
      color: #86909C;
      margin-right: 12px;
      min-width: 70px;
    }

    .log-level {
      margin-right: 12px;
      min-width: 50px;
      font-weight: 600;

      &.level-info {
        color: #3491FA;
      }

      &.level-debug {
        color: #99A3B4;
      }

      &.level-warn {
        color: #FF7D00;
      }

      &.level-error {
        color: #F53F3F;
      }
    }

    .log-message {
      color: #E5E6EB;
      flex: 1;
      word-break: break-all;
    }
  }
}
</style>
