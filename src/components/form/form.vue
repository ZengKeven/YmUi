<!-- @fallthroughAttributes true -->
<script setup lang="ts" vapor>
import { onScopeDispose, provide, useTemplateRef } from 'vue'
import { formKey, type FormField } from './context'
import { formControlKey } from './control-state'
import formProps from './props'
import type { FormInstance, FormItemMessage, FormResetOptions, FormStatusIconScope, FormSubmitContext, FormValidateContext, FormValidateOptions } from './types'

defineOptions({ name: 'YmForm' })
const props = defineProps(formProps)
const emit = defineEmits<{
  submit: [context: FormSubmitContext]
  validate: [context: FormValidateContext]
  reset: [context: { e: Event }]
}>()
const slots = defineSlots<{
  default?: (scope: { disabled: boolean; readonly: boolean }) => unknown
  statusIcon?: (scope: FormStatusIconScope) => unknown
}>()
const form = useTemplateRef<HTMLFormElement>('form')
const fields = new Set<FormField>()
let submitVersion = 0
function invalidateSubmission() { submitVersion++ }
provide(formControlKey, props)
provide(formKey, {
  props,
  invalidateSubmission,
  get statusIcon() { return slots.statusIcon },
  register(field) {
    invalidateSubmission()
    fields.add(field)
    return () => {
      fields.delete(field)
      invalidateSubmission()
    }
  },
})

function matching(names?: readonly string[]) {
  return [...fields].filter(field => field.name && (!names || names.includes(field.name)))
}

async function check(options: FormValidateOptions = {}, silent = false, version?: number): Promise<FormValidateContext> {
  const ordered = matching(options.fields).sort((a, b) => {
    if (!a.element || !b.element || a.element === b.element) return 0
    return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  })
  const results = await Promise.all(ordered.map(async field => ({
    field, name: field.name,
    result: await field.validate(options.trigger ?? 'all', { silent, showErrorMessage: options.showErrorMessage }),
  })))
  const errors = results.flatMap(({ field, name, result }) =>
    result !== true && fields.has(field) && field.name === name ? [{ field, name, result }] : [])
  const first = errors[0]
  const context = {
    validateResult: first ? Object.fromEntries(errors.map(({ name, result }) => [name, result])) : true as const,
    firstError: first?.result.find(item => !item.result)?.message ?? '',
  }
  if (!silent && (version === undefined || version === submitVersion)) {
    if (props.scrollToFirstError) first?.field.element?.scrollIntoView({ behavior: props.scrollToFirstError, block: 'nearest' })
    emit('validate', context)
  }
  return context
}
const validate: FormInstance['validate'] = async options => (await check(options)).validateResult
const validateOnly: FormInstance['validateOnly'] = async options => (await check(options, true)).validateResult

let submitOptions: Pick<FormValidateOptions, 'showErrorMessage'> | undefined
let submission = Promise.resolve()
function onSubmit(e: SubmitEvent) {
  if (props.preventSubmitDefault) {
    e.preventDefault()
    e.stopPropagation()
  }
  const version = ++submitVersion
  submission = check(submitOptions, false, version).then(result => {
    if (version === submitVersion) emit('submit', { ...result, e })
  })
}
const submit: FormInstance['submit'] = async options => {
  if (!form.value) return
  submitOptions = options
  submission = Promise.resolve()
  try {
    HTMLFormElement.prototype.requestSubmit.call(form.value)
    return submission
  } finally {
    submitOptions = undefined
  }
}
let resetOptions: FormResetOptions | undefined
function onReset(e: Event) {
  const type = resetOptions?.type ?? props.resetType
  const targets = matching(resetOptions?.fields)
  // 原生 reset 总是还原整张表，局部重置或清空字段时由表单接管。
  if (props.preventSubmitDefault || resetOptions?.fields || (type === 'empty' && targets.length > 0)) e.preventDefault()
  if (props.preventSubmitDefault) e.stopPropagation()
  submitVersion++
  for (const field of targets) field.reset(type)
  // 重置父路径也可能触发子字段或联动规则，再统一清掉本批字段的反馈。
  for (const field of targets) field.clear()
  emit('reset', { e })
}
const reset: FormInstance['reset'] = options => {
  if (!form.value) return
  resetOptions = options
  try { HTMLFormElement.prototype.reset.call(form.value) }
  finally { resetOptions = undefined }
}
function clearValidate(names?: readonly string[]) {
  invalidateSubmission()
  for (const field of matching(names)) field.clear()
}
function setValidateMessage(messages: Record<string, readonly FormItemMessage[]>) {
  invalidateSubmission()
  for (const field of matching(Object.keys(messages))) field.setMessages(messages[field.name])
}
onScopeDispose(() => { submitVersion++ })
defineExpose({ validate, validateOnly, submit, reset, clearValidate, setValidateMessage } satisfies FormInstance)
</script>

<template>
  <form ref="form" class="ym-form" :data-layout="props.layout" :data-size="props.size" novalidate
    @submit="onSubmit" @reset="onReset">
    <slot :disabled="props.disabled" :readonly="props.readonly" />
  </form>
</template>
