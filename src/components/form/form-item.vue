<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { computed, defineVaporComponent, inject, onScopeDispose, ref, shallowRef, useId, useTemplateRef, watch, type InputHTMLAttributes } from 'vue'
import { YmIcon } from '../icon'
import { formKey, type FormField } from './context'
import { provideFieldReset } from './field-reset'
import itemProps from './item-props'
import type { FormItemMessage, FormStatusIconScope } from './types'
import type { FormRule, FormRuleResult, FormValidateTrigger } from './rule-types'
import { cloneField, emptyField, getField, matchesTrigger, setField, validateRules } from './validation'

defineOptions({ name: 'YmFormItem' })
const props = defineProps(itemProps)
type ControlAttrs = Pick<InputHTMLAttributes, 'id' | 'aria-required' | 'aria-invalid' | 'aria-describedby' | 'aria-labelledby'>
const slots = defineSlots<{
  default?: (scope: { id: string; controlProps: ControlAttrs }) => unknown
  label?: () => unknown
  help?: () => unknown
  tips?: () => unknown
  statusIcon?: (scope: FormStatusIconScope) => unknown
}>()
const form = inject(formKey, undefined)
const notifyReset = provideFieldReset()
const root = useTemplateRef<HTMLElement>('root')
const uid = useId()
const id = computed(() => props.for || `ym-form-control-${uid}`)
const hasLabel = computed(() => !!(slots.label || props.label))
const labelAlign = computed(() => props.labelAlign ?? form?.props.labelAlign ?? 'right')
const labelWidth = computed(() => props.labelWidth ?? form?.props.labelWidth ?? 100)
const hideLabel = computed(() => Number(labelWidth.value) === 0)
const labelGroup = computed(() => !props.for && hasLabel.value && !hideLabel.value)
const value = computed(() => props.name && form?.props.data ? getField(form.props.data, props.name) : undefined)
const rules = computed<readonly FormRule[]>(() => {
  if (props.rules?.length) return props.rules
  const inherited = props.name && form?.props.rules ? getField(form.props.rules, props.name) : undefined
  return Array.isArray(inherited) ? inherited : []
})
const required = computed(() => rules.value.some(rule => rule.required))
const showMark = computed(() => props.requiredMark ?? form?.props.requiredMark ?? required.value)
const feedback = shallowRef<FormItemMessage>()
const showMessageOverride = ref<boolean>()
const showFieldMessages = computed(() => props.showErrorMessage ?? form?.props.showErrorMessage ?? true)
const showMessage = computed(() => showMessageOverride.value ?? showFieldMessages.value)
const status = computed(() => props.status ?? (showMessage.value ? feedback.value?.type : undefined))
const message = computed(() => showMessage.value || feedback.value?.type === 'success' ? feedback.value?.message : undefined)
const helpId = computed(() => slots.help || props.help ? `${uid}-help` : undefined)
const tipsId = computed(() => slots.tips || props.tips ? `${uid}-tips` : undefined)
const description = computed(() => [helpId.value, tipsId.value, message.value && `${uid}-message`].filter(Boolean).join(' ') || undefined)
const controlProps = computed<ControlAttrs>(() => ({
  id: id.value,
  'aria-required': required.value || undefined,
  'aria-invalid': (props.status ?? feedback.value?.type) === 'error' || undefined,
  'aria-labelledby': hasLabel.value && !hideLabel.value ? `${uid}-label` : undefined,
  'aria-describedby': description.value,
}))
const showIcon = computed(() => props.statusIcon !== false && (slots.statusIcon || props.statusIcon
  || form?.statusIcon || form?.props.statusIcon))
const FormStatusIcon = defineVaporComponent((scope: FormStatusIconScope) => form?.statusIcon?.(scope), {
  props: ['status', 'name'], inheritAttrs: false,
})

let initial = cloneField(value.value)
let generation = 0
let resetting = false

function clear() {
  generation++
  feedback.value = undefined
  showMessageOverride.value = undefined
}

async function validate(trigger: FormValidateTrigger, options: { silent?: boolean; showErrorMessage?: boolean } = {}): Promise<true | FormRuleResult[]> {
  const data = form?.props.data
  if (!props.name || !data) return true
  const matched = rules.value.filter(rule => matchesTrigger(rule, trigger))
  if (!matched.length) {
    if (!options.silent && !rules.value.length) clear()
    return true
  }
  const run = options.silent ? generation : ++generation
  const results = await validateRules(value.value, matched, { formData: data, name: props.name, label: props.label, errorMessage: form?.props.errorMessage })
  const failure = results.find(result => !result.result)
  if (!options.silent && run === generation) {
    const success = results.find(result => result.result && result.type === 'success' && result.message)
    feedback.value = failure ? { type: failure.type === 'warning' ? 'warning' : 'error', message: failure.message ?? '' }
      : { type: 'success', message: success?.message ?? '' }
    showMessageOverride.value = options.showErrorMessage
  }
  return failure ? results : true
}

function reset(type: 'empty' | 'initial') {
  clear()
  if (!props.name || !form?.props.data) return
  resetting = true
  try {
    setField(form.props.data, props.name, type === 'initial' ? cloneField(initial) : emptyField(value.value))
    notifyReset(type)
  } finally {
    resetting = false
  }
}

function setMessages(messages: readonly FormItemMessage[]) {
  clear()
  feedback.value = messages.find(item => item.type !== 'success') ?? messages[0] ?? { type: 'success', message: '' }
}

watch(() => props.name, () => {
  form?.invalidateSubmission()
  clear()
  initial = cloneField(value.value)
}, { flush: 'sync' })
watch([value, rules], () => {
  form?.invalidateSubmission()
  // 数据更新后，较早的异步结果不能再写回，即使新值只配置了失焦校验。
  generation++
  if (!resetting) {
    if (rules.value.length) void validate('change')
    else clear()
  }
}, { deep: true, flush: 'sync' })
function blur(event: FocusEvent) {
  const node = root.value
  if (!node || !(event.target instanceof Element) || event.target.closest('.ym-form__item') !== node) return
  if (event.relatedTarget instanceof Node && node.contains(event.relatedTarget)) return
  void validate('blur')
}
const field: FormField = {
  get name() { return props.name },
  get element() { return root.value },
  validate, reset, clear, setMessages,
}
const unregister = form?.register(field)
onScopeDispose(() => { generation++; unregister?.() })
</script>

<template>
  <div ref="root" class="ym-form__item" :data-name="props.name || undefined" :data-align="labelAlign" :data-status="status"
    :data-hide-label="hideLabel || undefined" :data-success-border="props.successBorder || props.status === 'success' || undefined"
    :style="{ '--ym-form-label-width': typeof labelWidth === 'number' ? labelWidth + 'px' : labelWidth }"
    :role="labelGroup ? 'group' : undefined" :aria-labelledby="labelGroup ? uid + '-label' : undefined"
    :aria-describedby="labelGroup ? description : undefined" @focusout="blur">
    <div v-if="!hideLabel && (hasLabel || labelAlign !== 'top')" class="ym-form__label">
      <template v-if="hasLabel">
        <span v-if="showMark && form?.props.requiredMarkPosition !== 'right'" class="ym-form__required" aria-hidden="true">*</span>
        <label :id="uid + '-label'" :for="id"><slot name="label">{{ props.label }}</slot></label>
        <span v-if="showMark && form?.props.requiredMarkPosition === 'right'" class="ym-form__required" aria-hidden="true">*</span>
        <span v-if="form?.props.colon" aria-hidden="true">：</span>
      </template>
    </div>
    <div class="ym-form__body">
      <div class="ym-form__controls">
        <slot :id="id" :control-props="controlProps" />
        <span v-if="showIcon" class="ym-form__status-icon">
          <slot name="statusIcon" :status="status" :name="props.name">
            <FormStatusIcon v-if="form?.statusIcon && !props.statusIcon" :status="status" :name="props.name" />
            <YmIcon v-else-if="status" :name="status" />
          </slot>
        </span>
      </div>
      <div v-if="helpId" :id="helpId" class="ym-form__help"><slot name="help">{{ props.help }}</slot></div>
      <div v-if="tipsId" :id="tipsId" class="ym-form__tips"><slot name="tips">{{ props.tips }}</slot></div>
      <div v-if="message || (props.name && showFieldMessages)" :id="uid + '-message'" class="ym-form__message" role="status">{{ message }}</div>
    </div>
  </div>
</template>
