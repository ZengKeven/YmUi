<script setup lang="ts" vapor>
import { ConfigProvider, YmButton } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
</script>

<template>
  <PreviewFrame name="ConfigProvider" global-only>
    <template #preview>
      <div class="config-demo">
        <YmButton>保存</YmButton>
        <YmButton variant="outline">取消</YmButton>
      </div>
    </template>
    <section class="example-section">
      <h3>局部覆盖</h3>
      <ConfigProvider class="demo-row" size="small" :radius="0">
        <YmButton>局部小尺寸</YmButton>
        <YmButton variant="outline" size="large">显式大尺寸</YmButton>
        <YmButton theme="default" shape="round">胶囊形状</YmButton>
      </ConfigProvider>
    </section>
  </PreviewFrame>
</template>

<style scoped>
.config-demo { display: flex; flex-wrap: wrap; gap: .75rem; }
</style>
