<script setup lang="ts" vapor>
import { useId } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'

defineOptions({ name: 'YmLayoutAside' })
const props = defineProps<{ logo?: string; systemName?: string; collapsed: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
const asideId = useId()
</script>

<template>
  <aside :id="asideId" class="ym-layout__aside" :class="{ 'ym-layout__aside--collapsed': props.collapsed }">
    <div class="ym-layout__brand">
      <img v-if="props.logo" class="ym-layout__logo" :src="props.logo"
        :alt="props.collapsed || !props.systemName ? props.systemName || '系统标志' : ''" />
      <span v-if="!props.collapsed && props.systemName" class="ym-layout__name">{{ props.systemName }}</span>
    </div>
    <div class="ym-layout__navigation"><slot /></div>
    <YmButton class="ym-layout__toggle" variant="text" shape="square"
      :aria-label="props.collapsed ? '展开侧栏' : '收起侧栏'" :aria-expanded="!props.collapsed"
      :aria-controls="asideId" @click="emit('toggle')">
      <template #icon><YmIcon :name="props.collapsed ? 'sidebar-expand' : 'sidebar-collapse'" /></template>
    </YmButton>
  </aside>
</template>
