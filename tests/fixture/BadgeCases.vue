<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmBadge, YmButton, type ControlSize } from 'ym-ui-vapor'

const count = ref<string | number>(0)
const maxCount = ref(99)
const showZero = ref(false)
const dot = ref(false)
const shifted = ref(false)
const size = ref<ControlSize>('medium')
const dark = ref(false)
const square = ref(false)
const danger = ref('#a51739')
</script>

<template>
  <main>
    <label>徽标内容 <input v-model="count" /></label>
    <label>封顶值 <input v-model.number="maxCount" type="number" /></label>
    <label><input v-model="showZero" type="checkbox" /> 显示零值</label>
    <label><input v-model="dot" type="checkbox" /> 圆点模式</label>
    <label><input v-model="shifted" type="checkbox" /> 移动角标</label>
    <p>
      <YmBadge id="messages" :count="count" :max-count="maxCount" :show-zero="showZero" :dot="dot"
        :offset="shifted ? [10, '-0.5rem'] : undefined">
        <button type="button">消息</button>
      </YmBadge>
    </p>
    <p><YmBadge id="default-badge" content="收件箱" /></p>
    <p><YmBadge id="content-slot" :count="101" content="属性正文"><template #content><b>待办</b></template></YmBadge></p>
    <p>
      <YmBadge id="count-slot" content="属性正文" :dot="dot">
        <template #default><button type="button">审批</button></template>
        <template #content>备用正文</template>
        <template #count><strong>待处理</strong></template>
      </YmBadge>
    </p>
    <p id="standalone"><YmBadge count="NEW" /></p>

    <label>全局尺寸
      <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select>
    </label>
    <label>浅色警示色 <input v-model="danger" type="color" /></label>
    <label><input v-model="dark" type="checkbox" /> 深色模式</label>
    <label><input v-model="square" type="checkbox" /> 直角</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="12"
      :theme="{ light: { danger, onAccent: '#fff8ef' }, dark: { danger: '#ef9aab', onAccent: '#241320' } }">
      <ConfigProvider :radius="square ? 0 : 3">
        <YmBadge id="inherited" :count="8" shape="round"><YmButton>继承尺寸</YmButton></YmBadge>
        <YmBadge id="local" :count="8" size="small" color="#2855a0"><YmButton>局部尺寸</YmButton></YmBadge>
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
