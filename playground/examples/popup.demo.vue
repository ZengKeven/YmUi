<script setup lang="ts" vapor>
import { ref } from 'vue'
import { YmButton, YmPopup, type PopupProps } from '../../src'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const trigger = ref<PopupProps['trigger']>('click')
const placement = ref<PopupProps['placement']>('bottom')
const size = ref<PopupProps['size']>()
</script>

<template>
  <PreviewFrame name="YmPopup">
    <template #preview>
      <YmPopup :trigger="trigger" :placement="placement" :size="size">
        <template #default="{ visible, panelId }">
          <YmButton variant="outline" :aria-expanded="visible" :aria-controls="visible ? panelId : undefined">
            配送说明
          </YmButton>
        </template>
        <template #content="{ close }">
          <p>发货后可在物流记录中查看运单号。</p>
          <YmButton variant="text" @click="close()">知道了</YmButton>
        </template>
      </YmPopup>
    </template>
    <template #controls>
      <label>触发方式
        <select v-model="trigger">
          <option value="click">点击</option><option value="hover">悬停或聚焦</option>
        </select>
      </label>
      <label>浮层位置
        <select v-model="placement">
          <option value="top">上方</option><option value="bottom">下方</option>
          <option value="left">左侧</option><option value="right">右侧</option>
        </select>
      </label>
      <label>浮层尺寸
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
        </select>
      </label>
    </template>
  </PreviewFrame>
</template>
