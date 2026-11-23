import type { InjectionKey } from 'vue'
import type { CheckboxValue } from './types'

export const checkboxGroupKey: InjectionKey<{
  readonly selected: readonly CheckboxValue[]
  readonly disabled: boolean
  readonly name?: string
  toggle(value: CheckboxValue, checked: boolean, e: Event): void
} | undefined> = Symbol('YmCheckboxGroup')
