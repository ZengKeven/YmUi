import type { InjectionKey } from 'vue'
import type { RadioValue } from './types'

export const radioGroupKey: InjectionKey<{
  readonly selected: RadioValue | undefined
  readonly name: string
  readonly disabled: boolean
  select(value: RadioValue, event: Event): void
}> = Symbol('YmRadioGroup')
