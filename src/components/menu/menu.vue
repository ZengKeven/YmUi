<script setup lang="ts" vapor>
import { ref, useModel, watchEffect } from 'vue'
import MenuBranch from './menu-branch.vue'
import menuProps from './props'
import type { MenuValue } from './types'

defineOptions({ name: 'YmMenu' })
const props = defineProps(menuProps)
defineEmits<{
  'update:modelValue': [value: MenuValue]
  'update:expanded': [values: MenuValue[]]
}>()
const selected = useModel(props, 'modelValue')
const expanded = useModel(props, 'expanded')
const popup = ref<MenuValue>()

watchEffect(() => {
  if (!props.collapsed || !props.items.some(item => item.value === popup.value)) popup.value = undefined
})

function toggleGroup(value: MenuValue) {
  expanded.value = expanded.value.includes(value)
    ? expanded.value.filter(open => open !== value)
    : [...expanded.value, value]
}
</script>

<template>
  <nav class="ym-menu" aria-label="导航菜单" :class="{ 'ym-menu--collapsed': props.collapsed }" :data-size="props.size">
    <ul class="ym-menu__list">
      <MenuBranch v-for="item in props.items" :key="item.value" :item="item" :collapsed="props.collapsed"
        :selected="selected" :expanded="expanded.includes(item.value)" :popup-open="popup === item.value"
        @select="selected = $event" @toggle="toggleGroup(item.value)"
        @open="popup = item.value" @close="popup === item.value && (popup = undefined)" />
    </ul>
  </nav>
</template>
