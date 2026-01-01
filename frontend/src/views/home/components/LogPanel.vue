<template>
  <div class="log-section">
    <div class="header">
      <span class="title">Real-time Logs</span>
      <a-button size="mini" @click="$emit('clear')">
        <template #icon><icon-refresh /></template>
        Clear
      </a-button>
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
import { IconRefresh } from '@arco-design/web-vue/es/icon';

defineProps<{
  logs: Array<{
    time: string;
    level: string;
    message: string;
  }>;
}>();

defineEmits(['clear']);
</script>

<style scoped lang="less">
.log-section {
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
