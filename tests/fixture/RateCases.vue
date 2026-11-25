<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmRate, type ControlSize } from 'ym-ui-vapor'

const updates = ref<number[]>([])
const changes = ref<number[]>([])
const score = ref(1.5)
const accept = ref(false)
const disabled = ref(false)
const size = ref<ControlSize>('medium')
const dark = ref(false)
const square = ref(false)
const warning = ref('#803045')

function update(value: number) {
  updates.value.push(value)
  if (accept.value) score.value = value
}
</script>

<template>
  <main>
    <p><YmRate id="basic" /></p>
    <p><YmRate id="half" :default-value="1.5" :gap="12" allow-half clearable show-text
      :texts="['一星', '二星', '三星', '四星', '五星']"
      @update:model-value="updates.push($event)" @change="changes.push($event)" /></p>
    <p><YmRate id="controlled" aria-label="服务评分" :model-value="score" :value="4" :default-value="3"
      allow-half :disabled="disabled" @update:model-value="update" @change="changes.push($event)" /></p>
    <label><input type="checkbox" v-model="accept"> 接受评分</label>
    <label><input type="checkbox" v-model="disabled"> 禁用评分</label>
    <button type="button" @click="score = 4.5">外部设为 4.5 分</button>
    <output id="updates">{{ updates.join(',') }}</output>
    <output id="changes">{{ changes.join(',') }}</output>

    <p><YmRate id="custom" :value="2.5" :count="3" :size="30" :gap="9" allow-half
      :color="['#aa1133', '#bbccdd']">
      <template #icon="{ index, size, color }"><b :style="{ fontSize: size, color }">{{ index }}</b></template>
    </YmRate></p>
    <label>全局尺寸 <select v-model="size"><option>extra-small</option><option>small</option><option>medium</option><option>large</option></select></label>
    <label>浅色评分颜色 <input type="color" v-model="warning"></label>
    <label><input type="checkbox" v-model="dark"> 深色模式</label>
    <label><input type="checkbox" v-model="square"> 直角焦点框</label>
    <ConfigProvider :size="size" :mode="dark ? 'dark' : 'light'" :radius="11"
      :theme="{ light: { warning, border: '#95a6b7' }, dark: { warning: '#f3a765', border: '#48596a' } }">
      <ConfigProvider :radius="square ? 0 : 3">
        <YmRate id="inherited" :default-value="1" />
        <YmRate id="local" :default-value="1" size="small" color="#1665ac" />
      </ConfigProvider>
    </ConfigProvider>
  </main>
</template>
