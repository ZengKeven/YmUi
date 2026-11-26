<script setup lang="ts" vapor>
import { computed } from 'vue'
import MarkdownNodes from './MarkdownNodes.vue'
import { parseMarkdown } from './parse'
import chatMarkdownProps from './props'

defineOptions({ name: 'YmChatMarkdown' })
const props = defineProps(chatMarkdownProps)
const nodes = computed(() => parseMarkdown(props.content))
</script>

<template>
  <div class="ym-chat-markdown ym-theme" :data-size="props.size">
    <MarkdownNodes :nodes="nodes" />
  </div>
</template>
