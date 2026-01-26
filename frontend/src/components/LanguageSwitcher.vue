<template>
  <a-dropdown @select="handleSelect">
    <a-button type="text" size="small">
      <template #icon>
        <icon-language />
      </template>
      {{ currentLanguage }}
    </a-button>
    <template #content>
      <a-doption value="en">English</a-doption>
      <a-doption value="zh">中文</a-doption>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconLanguage } from '@arco-design/web-vue/es/icon'

const { locale } = useI18n()

const currentLanguage = computed(() => {
  return locale.value === 'zh' ? '中文' : 'English'
})

const handleSelect = (value: string | number | Record<string, any> | undefined) => {
  const newLocale = String(value)
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}
</script>

<style scoped lang="less">
:deep(.arco-btn-text) {
  color: var(--color-text-1);
  
  &:hover {
    background-color: var(--color-fill-2);
  }
}
</style>
