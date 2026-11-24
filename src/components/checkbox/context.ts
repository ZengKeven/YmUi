import type { InjectionKey } from 'vue'
import type { CheckboxGroupProps, CheckboxValue } from './types'

export const checkboxGroupKey: InjectionKey<{
  readonly selected: readonly CheckboxValue[]
  readonly disabled: boolean
  readonly theme: CheckboxGroupProps['theme']
  readonly name?: string
  toggle(value: CheckboxValue, checked: boolean, e: Event): void
} | undefined> = Symbol('YmCheckboxGroup')
