<script setup lang="ts" vapor>
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import type { MenuLeaf, MenuValue } from './types'

const props = defineProps<{ items: readonly MenuLeaf[]; selected?: MenuValue }>()
const emit = defineEmits<{ select: [value: MenuValue] }>()
</script>

<template>
  <ul class="ym-menu__list">
    <li v-for="item in props.items" :key="item.value">
      <YmButton class="ym-menu__item" :href="item.href" :content="item.label"
        :theme="props.selected === item.value ? 'primary' : 'default'"
        :variant="props.selected === item.value ? 'base' : 'text'"
        :aria-current="props.selected === item.value ? 'page' : undefined" @click="emit('select', item.value)">
        <template v-if="item.icon" #icon><YmIcon :name="item.icon" /></template>
      </YmButton>
    </li>
  </ul>
</template>
