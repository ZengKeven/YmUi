<script setup lang="ts" vapor>
import { computed, ref } from 'vue'
import { YmIcon, type IconName } from '../../src'
import { iconGroups, iconLabels } from './icon-catalog'
import PreviewFrame from './PreviewFrame.vue'
import { sizes } from './settings'

const name = ref<IconName>('user')
const size = ref<string | undefined>('30px')
const color = ref<string>()
const query = ref('')
const visibleGroups = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return iconGroups
  return iconGroups.map(({ label, names }) => ({
    label,
    names: names.filter(key => key.includes(term) || iconLabels[key].toLowerCase().includes(term)),
  })).filter(group => group.names.length)
})
</script>

<template>
  <PreviewFrame name="YmIcon">
    <template #preview>
      <YmIcon :name="name" :size="size" :color="color" :aria-label="iconLabels[name]" />
    </template>
    <template #controls>
      <label>name
        <select v-model="name">
          <optgroup v-for="group in iconGroups" :key="group.label" :label="group.label">
            <option v-for="key in group.names" :key="key" :value="key">{{ key }} · {{ iconLabels[key] }}</option>
          </optgroup>
        </select>
      </label>
      <label>size
        <select v-model="size">
          <option :value="undefined">继承</option>
          <option v-for="[value] in sizes" :key="value">{{ value }}</option>
          <option v-for="value in ['16px', '20px', '30px', '32px']" :key="value">{{ value }}</option>
        </select>
      </label>
      <label>color
        <select v-model="color">
          <option :value="undefined">继承</option>
          <option value="var(--ym-color-primary)">主题色</option>
          <option value="var(--ym-color-success)">成功色</option>
        </select>
      </label>
    </template>
    <section class="example-section icon-gallery">
      <div class="icon-gallery-header">
        <h3>内置图标</h3>
        <input v-model="query" type="search" aria-label="查找图标" placeholder="搜索中文或英文名" />
      </div>
      <section v-for="group in visibleGroups" :key="group.label" class="icon-group" :aria-label="group.label">
        <h4>{{ group.label }} <span>{{ group.names.length }}</span></h4>
        <div class="icon-grid">
          <button v-for="key in group.names" :key="key" type="button" class="icon-tile"
            :aria-label="iconLabels[key] + ' · ' + key" :aria-pressed="key === name" @click="name = key">
            <YmIcon :name="key" :size="size" />
            <span>{{ iconLabels[key] }}</span>
            <span class="icon-key">{{ key }}</span>
          </button>
        </div>
      </section>
      <p v-if="!visibleGroups.length" role="status">没有匹配的图标</p>
    </section>
  </PreviewFrame>
</template>
