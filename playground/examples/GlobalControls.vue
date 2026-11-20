<script setup lang="ts" vapor>
import { settings, sizes } from './settings'
</script>

<template>
  <label>显示模式
    <select v-model="settings.mode">
      <option value="auto">跟随文档</option><option value="light">浅色</option><option value="dark">深色</option>
    </select>
  </label>
  <label>默认尺寸
    <select v-model="settings.size">
      <option v-for="[value, label] in sizes" :key="value" :value="value">{{ label }}</option>
    </select>
  </label>
  <label>圆角
    <span class="radius-field"><input v-model.number="settings.radius" type="range" min="0" max="24" />
      <output>{{ settings.radius }} px</output></span>
  </label>
  <label>浅色品牌色 <input v-model="settings.lightPrimary" type="color" /></label>
  <label>深色品牌色 <input v-model="settings.darkPrimary" type="color" /></label>
</template>
