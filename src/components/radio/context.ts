import type { InjectionKey } from 'vue'
import type { RadioGroupProps, RadioValue } from './types'

export const radioGroupKey: InjectionKey<{
  readonly selected: RadioValue | undefined
  readonly name: string
  readonly disabled: boolean
  readonly theme: RadioGroupProps['theme']
  select(value: RadioValue, event: Event): void
}> = Symbol('YmRadioGroup')
