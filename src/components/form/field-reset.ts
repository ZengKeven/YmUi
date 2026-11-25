import { inject, onScopeDispose, provide, type InjectionKey } from 'vue'
import type { FormResetType } from './types'

type ResetControl = (type: FormResetType) => void
const resetKey: InjectionKey<Set<ResetControl>> = Symbol('YmFormItemReset')

export function provideFieldReset() {
  const controls = new Set<ResetControl>()
  provide(resetKey, controls)
  return (type: FormResetType) => {
    for (const reset of controls) reset(type)
  }
}

/** 字段重置时同步控件的编辑草稿和本地后备值。 */
export function onFormFieldReset(reset: ResetControl) {
  const controls = inject(resetKey, undefined)
  if (!controls) return
  controls.add(reset)
  onScopeDispose(() => { controls.delete(reset) })
}
