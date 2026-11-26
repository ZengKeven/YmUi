<script setup lang="ts" vapor>
import { computed } from 'vue'
import { YmButton } from '../button'
import { YmIcon } from '../icon'
import suggestionProps from './props'
import type { ChatSuggestionItem, ChatSuggestionSelectContext } from './types'

defineOptions({ name: 'YmChatSuggestion' })
const props = defineProps(suggestionProps)
const emit = defineEmits<{
  select: [prompt: string, context: ChatSuggestionSelectContext]
}>()

const questions = computed(() => props.content
  .map((item, index) => ({ item, index }))
  .filter(({ item }) => typeof item?.title === 'string' && item.title.trim()))

function select(item: ChatSuggestionItem, index: number, e: MouseEvent) {
  const prompt = item.prompt?.trim() ? item.prompt : item.title
  emit('select', prompt, { item, index, e })
}
</script>

<template>
  <ul v-if="questions.length" class="ym-chat-suggestion ym-theme" role="list" aria-label="推荐问题" :data-size="props.size">
    <li v-for="{ item, index } in questions" :key="index">
      <YmButton class="ym-chat-suggestion__button" variant="outline" :disabled="props.disabled"
        @click="select(item, index, $event)">
        {{ item.title }}
        <template #suffix><YmIcon name="arrow-right" /></template>
      </YmButton>
    </li>
  </ul>
</template>
