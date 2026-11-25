import { computed, inject, provide, type InjectionKey } from 'vue'

interface ControlState { disabled?: boolean; readonly?: boolean }
export const formControlKey: InjectionKey<Readonly<ControlState>> = Symbol('YmFormControls')

/** 复合控件把最终状态传给内部输入框、按钮和浮层，局部显式设置优先。 */
export function useFormControlState(props: Readonly<ControlState>, kind: 'text' | 'choice' | 'action') {
  const form = inject(formControlKey, undefined)
  const readOnly = computed(() => props.readonly ?? form?.readonly ?? false)
  // 原生表单会忽略 disabled 字段；只读仅锁定编辑，不应丢失提交值。
  const nativeDisabled = computed(() => props.disabled ?? form?.disabled ?? false)
  const disabled = computed(() => nativeDisabled.value || (kind === 'choice' && readOnly.value))
  if (form) provide(formControlKey, {
    get disabled() { return nativeDisabled.value },
    get readonly() { return readOnly.value },
  })
  return { disabled, nativeDisabled, readOnly }
}
