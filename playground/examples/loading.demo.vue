<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmLoading, YmSwitch, type ControlSize } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const loading = ref(true)
const indicator = ref(true)
const size = ref<ControlSize>()
const text = ref('正在加载')
const showOverlay = ref(false)
</script>

<template>
  <PreviewFrame name="YmLoading">
    <template #preview>
      <YmLoading :loading="loading" :indicator="indicator" :size="size" :text="text" />
    </template>
    <template #controls>
      <label>loading <YmSwitch v-model="loading" /></label>
      <label>indicator <YmSwitch v-model="indicator" /></label>
      <label>size
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value] in sizes" :key="value">{{ value }}</option>
        </select>
      </label>
      <label>text <input v-model="text" type="text" /></label>
    </template>
    <section class="example-section">
      <h3>区域遮罩</h3>
      <div class="demo-row">
        <label><input v-model="showOverlay" type="checkbox" /> 显示遮罩</label>
        <YmLoading :loading="showOverlay" text="正在加载"><span class="loading-preview">订单详情</span></YmLoading>
      </div>
    </section>
  </PreviewFrame>
</template>
