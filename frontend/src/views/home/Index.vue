<template>
  <div class="layout-container">
    <a-layout style="height: 100%;">
      <a-layout>
        <a-layout-sider :resize-directions="['right']">
          Sider
        </a-layout-sider>
        <a-layout-content>Content</a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<style scoped>
.layout-container {
  width: 100%;
  height: 100vh;
}

.layout-container :deep(.arco-layout-sider) {
  min-width: 350px;
  max-width: 40%;
}
</style>