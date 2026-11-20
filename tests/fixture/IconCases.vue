<script setup lang="ts" vapor>
import { ref } from 'vue'
import { ConfigProvider, YmIcon, type IconName, type IconProps } from 'ym-ui-vapor'
import { iconPaths } from '../../src/components/icon/icons'

const names = Object.keys(iconPaths)
const name = ref<IconName>('add')
const size = ref<IconProps['size']>()
const labelled = ref(false)
const clicks = ref(0)

const record: NonNullable<IconProps['onClick']> = ({ e }) => {
  if (e instanceof MouseEvent && e.currentTarget instanceof SVGSVGElement) clicks.value++
}
</script>

<template>
  <ConfigProvider mode="dark" size="large">
    <label for="icon-name">图标名称</label>
    <select id="icon-name" v-model="name"><option v-for="key in names" :key="key">{{ key }}</option></select>
    <label>图标尺寸
      <select v-model="size">
        <option :value="undefined">继承</option>
        <option>small</option><option :value="28">28</option><option>2em</option>
      </select>
    </label>
    <label><input v-model="labelled" type="checkbox" /> 命名图标</label>
    <YmIcon id="test-icon" :name="name" :size="size" :aria-label="labelled ? '操作图标' : undefined"
      @click="record" />
    <output id="icon-clicks">{{ clicks }}</output>
  </ConfigProvider>
  <span style="font-size: 20px; color: #345678">
    <span id="icon-caption">行内加号</span>
    <YmIcon name="add" aria-labelledby="icon-caption" />
  </span>
</template>
