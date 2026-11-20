<script setup lang="ts" vapor>
import { computed, inject, onScopeDispose, useId } from 'vue'
import { YmButton } from '../button'
import { tabsKey } from './context'
import { tabPanelProps } from './props'

defineOptions({ name: 'YmTabPanel' })
const props = defineProps(tabPanelProps)
const slots = defineSlots<{ default?: () => unknown; label?: () => unknown; action?: () => unknown }>()
const tabs = inject(tabsKey)
if (!tabs) throw new Error('YmTabPanel 需要放在 YmTabs 内。')
const { active, tablist, actions, register, select } = tabs
onScopeDispose(register(props))
const selected = computed(() => props.value === active.value)
const id = useId()
</script>

<template>
  <div :id="`${id}-panel`" class="ym-tabs__panel" role="tabpanel" :aria-labelledby="`${id}-tab`"
    :hidden="!selected" tabindex="0">
    <Teleport v-if="tablist" :to="tablist">
      <YmButton :id="`${id}-tab`" class="ym-tabs__tab" role="tab" variant="text"
        :aria-controls="`${id}-panel`" :aria-selected="selected" :tabindex="selected ? 0 : -1"
        @click="select(props.value)">
        <slot name="label">{{ props.label ?? props.value }}</slot>
      </YmButton>
    </Teleport>
    <Teleport v-if="slots.action && actions" :to="actions">
      <div class="ym-tabs__action" :hidden="!selected"><slot name="action" /></div>
    </Teleport>
    <slot />
  </div>
</template>
