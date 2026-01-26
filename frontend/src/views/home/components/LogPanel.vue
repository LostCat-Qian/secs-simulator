<template>
  <div class="log-section">
    <!-- Header -->
    <div class="header">
      <span class="title" :title="title">{{ title }}</span>
      <div class="actions">
        <a-input
          v-if="true"
          v-model="searchText"
          :placeholder="t('common.search')"
          size="mini"
          allow-clear
          class="search-input"
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-button size="mini" type="text" @click="handleClear">
          <template #icon><icon-refresh /></template>
        </a-button>
        <a-button size="mini" type="text" @click="handleClose">
          <template #icon><icon-close /></template>
        </a-button>
      </div>
    </div>

    <div ref="logContainerRef" class="log-container">
      <div v-for="(log, index) in filteredLogs" :key="index" class="log-item">
        <span class="log-time">{{ log.time }}</span>
        <span :class="['log-level', `level-${log.level.toLowerCase()}`]">[{{ log.level }}]</span>
        <span class="log-message">{{ log.message }}</span>
      </div>

      <!-- Empty State -->
      <div v-if="filteredLogs.length === 0" class="empty-log">
        {{ searchText ? t('logs.noMatching') : t('logs.noLogs') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { IconRefresh, IconClose, IconSearch } from '@arco-design/web-vue/es/icon';
import type { LogEntry } from '../types';

const { t } = useI18n()

const props = defineProps<{
  title?: string;
  logs: LogEntry[];
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'close'): void;
}>();

const logContainerRef = ref<HTMLElement | null>(null);
const searchText = ref('');

const filteredLogs = computed(() => {
  if (!searchText.value) return props.logs;
  const query = searchText.value.toLowerCase();
  return props.logs.filter(log => 
    log.message.toLowerCase().includes(query) ||
    log.level.toLowerCase().includes(query) ||
    log.time.toLowerCase().includes(query)
  );
});

const handleClear = () => {
  emit('clear');
};

const handleClose = () => {
  emit('close');
};

const scrollToBottom = () => {
  const el = logContainerRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
};

watch(
  () => [props.logs.length, props.logs[props.logs.length - 1]],
  async () => {
    // Only auto-scroll if we are not searching, or if the user wants it (simplified: always scroll for now if new logs come)
    // However, if searching, the list might be short.
    await nextTick();
    scrollToBottom();
  }
);

watch(
  () => searchText.value,
  async () => {
    await nextTick();
    // Maybe scroll to top or keep position? 
    // Usually when searching, you want to see results.
  }
);

onMounted(() => {
  scrollToBottom();
});
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

    .search-input {
      width: 120px;
      transition: width 0.3s;
      background-color: var(--color-fill-2);
      border-color: transparent;

      &:focus-within {
        width: 180px;
        background-color: var(--color-bg-1);
        border-color: rgb(var(--primary-6));
      }
    }
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
  white-space: pre-wrap;
}

.empty-log {
  color: #666;
  text-align: center;
  padding-top: 20px;
  font-style: italic;
}
</style>
