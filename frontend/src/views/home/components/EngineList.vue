<template>
  <div class="engine-section">
    <!-- Header -->
    <div class="header">
      <span class="title">{{ t('engine.title') }}</span>
      <div class="actions">
        <a-input v-model="searchText" :placeholder="t('common.search')" size="mini" allow-clear class="search-input">
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-button type="primary" size="mini" @click="$emit('add')">
          <template #icon><icon-plus /></template>
          <template #default>{{ t('common.add') }}</template>
        </a-button>
      </div>
    </div>

    <!-- Engine List -->
    <div class="list-container">
      <div v-for="(item, index) in filteredEngines" :key="item.fileName || index" :class="[
        'engine-item',
        {
          active: item.status === 'running',
          waiting: item.status === 'connecting'
        }
      ]" @click="$emit('select', item)">
        <div class="engine-icon">
          <icon-folder />
        </div>
        <div class="engine-info">
          <div class="engine-name" :title="item.name">{{ item.name }}</div>
          <div v-if="item.status === 'running' || item.status === 'connecting'" class="engine-status">
            <span class="status-dot" :class="{
              waiting: item.status === 'connecting',
              active: item.status === 'running'
            }"></span>
            <span v-if="item.status === 'running'" class="status-text active">{{ t('engine.active').toUpperCase() }}</span>
            <span v-else-if="item.status === 'connecting'" class="status-text waiting">{{ t('engine.connecting') }}</span>
          </div>
        </div>

        <a-dropdown @select="(value: string | number | Record<string, any>) => handleMenuSelect(value, item)"
          :popup-max-height="false">
          <a-button size="mini" class="action-btn" @click.stop> {{ t('engine.options') }} <icon-down /> </a-button>
          <template #content>
            <a-doption value="open" :disabled="item.status === 'running' || item.status === 'connecting'">
              <icon-apps /> {{ t('engine.open') }}
            </a-doption>
            <a-doption value="close" :disabled="item.status !== 'running' && item.status !== 'connecting'">
              <icon-close-circle /> {{ t('engine.close') }}
            </a-doption>
            <a-doption value="viewConfig"><icon-settings /> {{ t('engine.viewConfig') }}</a-doption>
            <a-doption value="edit" :disabled="item.status === 'running' || item.status === 'connecting'"><icon-edit />
              {{ t('engine.editConfig') }}
            </a-doption>
            <a-doption value="delete" :disabled="item.status === 'running' || item.status === 'connecting'">
              <icon-delete />
              {{ t('common.delete') }}
            </a-doption>
          </template>
        </a-dropdown>
      </div>

      <!-- Empty State -->
      <div v-if="filteredEngines.length === 0" class="empty-state">
        <a-empty :description="searchText ? t('engine.noMatching') : t('engine.noEngines')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IconPlus,
  IconFolder,
  IconEdit,
  IconDelete,
  IconApps,
  IconSettings,
  IconDown,
  IconCloseCircle,
  IconSearch
} from '@arco-design/web-vue/es/icon'
import type { EngineData } from '../types'

const { t } = useI18n()

const props = defineProps<{
  engines: EngineData[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'select', engine: EngineData): void
  (e: 'open', engine: EngineData): void
  (e: 'close', engine: EngineData): void
  (e: 'edit', engine: EngineData): void
  (e: 'delete', engine: EngineData): void
  (e: 'viewConfig', engine: EngineData): void
}>()

const searchText = ref('')

const filteredEngines = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  if (!query) return props.engines

  return props.engines.filter((engine) => {
    const name = String(engine.name || '').toLowerCase()
    const fileName = String(engine.fileName || '').toLowerCase()
    return name.includes(query) || fileName.includes(query)
  })
})

/**
 * Handles dropdown menu selection for a specific engine.
 * @param value The action key selected (e.g., 'open', 'edit')
 * @param item The engine item
 */
const handleMenuSelect = (value: string | number | Record<string, any>, item: EngineData) => {
  const action = String(value)
  switch (action) {
    case 'open':
      emit('open', item)
      break
    case 'close':
      emit('close', item)
      break
    case 'viewConfig':
      emit('viewConfig', item)
      break
    case 'edit':
      emit('edit', item)
      break
    case 'delete':
      emit('delete', item)
      break
  }
}
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

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 160px;
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
    background-color: rgba(var(--success-6), 0.1);
    border: 1px solid rgba(var(--success-6), 0.3);

    .engine-icon {
      color: rgb(var(--success-6));
    }
  }

  &.waiting {
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
      margin-right: 6px;
    }

    .status-dot.active {
      background-color: #00b42a;
    }

    .status-dot.waiting {
      background-color: rgb(var(--primary-6));
    }

    .status-text {
      font-size: 12px;
    }

    .status-text.active {
      color: #00b42a;
    }

    .status-text.waiting {
      color: rgb(var(--primary-6));
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
