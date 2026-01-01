<template>
  <div class="file-preview-section">
    <div class="header">
      <span class="title">File Preview</span>
    </div>
    <div class="content-container">
      <pre class="content">{{ content }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string;
}>();
</script>

<style scoped lang="less">
.file-preview-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-2);
}

.header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);

  .title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
  }
}

.content-container {
  flex: 1;
  overflow: auto;
  padding: 12px;
  background-color: var(--color-fill-1);

  .content {
    margin: 0;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-2);
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
