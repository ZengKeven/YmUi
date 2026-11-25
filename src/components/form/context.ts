import type { InjectionKey } from 'vue'
import type { FormItemMessage, FormProps, FormResetType, FormRuleResult, FormStatusIconScope, FormValidateTrigger } from './types'

export interface FormField {
  readonly name: string
  readonly element: HTMLElement | null
  validate(trigger: FormValidateTrigger, options?: { silent?: boolean; showErrorMessage?: boolean }): Promise<true | FormRuleResult[]>
  reset(type: FormResetType): void
  clear(): void
  setMessages(messages: readonly FormItemMessage[]): void
}

export const formKey: InjectionKey<{
  props: Readonly<FormProps>
  register(field: FormField): () => void
  invalidateSubmission(): void
  statusIcon?: (scope: FormStatusIconScope) => any
}> = Symbol('YmForm')
