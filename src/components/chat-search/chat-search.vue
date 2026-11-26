<script setup lang="ts" vapor>
import { computed, ref, useId } from 'vue'
import { safeHref } from '../../utils/safe-href'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import searchProps from './props'
import { hasSearchTitle } from './references'
import type { ChatSearchSourceContext } from './types'

defineOptions({ name: 'YmChatSearch' })
const props = defineProps(searchProps)
const emit = defineEmits<{
  'update:collapsed': [collapsed: boolean]
  'collapsed-change': [collapsed: boolean]
  'source-click': [href: string, context: ChatSearchSourceContext]
}>()

const panelId = `ym-chat-search-${useId()}`
const localCollapsed = ref(props.defaultCollapsed)
const collapsed = computed(() => props.collapsed ?? localCollapsed.value)
const results = computed(() => props.content?.references?.flatMap((item, index) =>
  hasSearchTitle(item) ? [{ item, index, href: safeHref(item.url) }] : []) ?? [])

function toggle() {
  const next = !collapsed.value
  if (props.collapsed === undefined) localCollapsed.value = next
  emit('update:collapsed', next)
  emit('collapsed-change', next)
}
</script>

<template>
  <div v-if="results.length" class="ym-chat-search ym-theme" :data-size="props.size">
    <YmButton class="ym-chat-search__toggle" variant="text" :aria-expanded="!collapsed" :aria-controls="panelId" @click="toggle">
      <template #icon><YmIcon name="search" /></template>
      {{ props.content?.title || `搜索结果（${results.length}）` }}
      <template #suffix><YmIcon :name="collapsed ? 'chevron-right' : 'chevron-down'" /></template>
    </YmButton>
    <ol :id="panelId" class="ym-chat-search__results" :hidden="collapsed">
      <li v-for="{ item, index, href } in results" :key="index">
        <a v-if="href" :href="href" target="_blank" rel="noopener noreferrer"
          @click="emit('source-click', href, { item, index, e: $event })">{{ item.title }}</a>
        <span v-else>{{ item.title }}</span>
        <div v-if="item.site || item.date" class="ym-chat-search__meta">
          <span v-if="item.site">{{ item.site }}</span><span v-if="item.date">{{ item.date }}</span>
        </div>
        <div v-if="item.content" class="ym-chat-search__summary">{{ item.content }}</div>
      </li>
    </ol>
  </div>
</template>
