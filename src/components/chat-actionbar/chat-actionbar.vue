<script setup lang="ts" vapor>
import { computed, onScopeDispose, ref, watch } from 'vue'
import { copyWithSelection } from '../../utils/clipboard'
import { YmButton } from '../button'
import { useFormControlState } from '../form/control-state'
import { YmIcon, type IconName } from '../icon'
import { YmTooltip } from '../tooltip'
import actionbarProps from './props'
import type { ChatActionbarAction, ChatActionbarComment } from './types'

defineOptions({ name: 'YmChatActionbar' })
const props = defineProps(actionbarProps)
const emit = defineEmits<{
  actions: [action: ChatActionbarAction, context: { e: MouseEvent }]
  'update:comment': [value: ChatActionbarComment]
}>()
const { disabled } = useFormControlState(props, 'action')
const buttons = {
  replay: { label: '重新生成', icon: 'refresh' },
  copy: { label: '复制', icon: 'copy' },
  good: { label: '点赞', icon: 'thumb-up' },
  bad: { label: '点踩', icon: 'thumb-down' },
} satisfies Record<ChatActionbarAction, { label: string; icon: IconName }>
const actions = computed(() => [...new Set(props.actionBar)].filter(action => Object.hasOwn(buttons, action)))
const localComment = ref<ChatActionbarComment>('')
const selected = computed(() => props.comment ?? localComment.value)

const feedback = ref('')
let copyRequest = 0
let timer: ReturnType<typeof setTimeout> | undefined
function clearFeedback() {
  copyRequest++
  clearTimeout(timer)
  feedback.value = ''
}
watch(() => props.content, clearFeedback)
onScopeDispose(clearFeedback)

async function copy(text: string) {
  clearFeedback()
  const request = copyRequest
  let copied = false
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      copied = true
    } else {
      copied = copyWithSelection(text)
    }
  } catch {
    // 写入被拒绝时在发起操作的消息旁提示，可再次点击重试。
  }
  // 剪贴板授权可能晚于下一次复制、正文更新或组件卸载。
  if (request !== copyRequest) return
  feedback.value = copied ? '已复制' : '复制失败，请重试'
  timer = setTimeout(clearFeedback, 2500)
}

function activate(action: ChatActionbarAction, e: MouseEvent) {
  if (disabled.value || (action === 'copy' && !props.content)) return
  if (action === 'copy') void copy(props.content)
  if (action === 'good' || action === 'bad') {
    const next = selected.value === action ? '' : action
    if (props.comment === undefined) localComment.value = next
    emit('update:comment', next)
  }
  emit('actions', action, { e })
}
</script>

<template>
  <div class="ym-chat-actionbar ym-theme" role="group" aria-label="消息操作" :data-size="props.size">
    <YmTooltip v-for="action in actions" :key="action" :content="buttons[action].label" :size="props.size">
      <YmButton variant="text" shape="square" :theme="selected === action ? 'primary' : 'default'"
        :disabled="disabled || (action === 'copy' && !props.content)" :aria-label="buttons[action].label"
        :aria-pressed="action === 'good' || action === 'bad' ? selected === action : undefined"
        @click="activate(action, $event)">
        <YmIcon :name="buttons[action].icon" />
      </YmButton>
    </YmTooltip>
    <span role="status" aria-atomic="true">{{ feedback }}</span>
  </div>
</template>
