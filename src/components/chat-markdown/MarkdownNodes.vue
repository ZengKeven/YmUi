<script setup lang="ts" vapor>
import type { MarkdownNode } from './parse'

defineProps<{ nodes: MarkdownNode[] }>()
</script>

<template>
  <template v-for="(node, index) in nodes" :key="index">
    <template v-if="typeof node === 'string'">{{ node }}</template>
    <br v-else-if="node.tag === 'br'">
    <hr v-else-if="node.tag === 'hr'">
    <component :is="node.tag" v-else v-bind="node.attrs">
      <MarkdownNodes :nodes="node.children" />
    </component>
  </template>
</template>
