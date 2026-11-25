import type { ControlSize } from '../config-provider/types'
import type { FormErrorMessage, FormRule, FormRuleResult, FormValidateTrigger } from './rule-types'

export type * from './rule-types'
export type FormStatus = 'success' | 'warning' | 'error'
export type FormResetType = 'empty' | 'initial'
export type FormValidateResult = true | Record<string, FormRuleResult[]>
/** 以字段路径为键，也可按数据层级组织规则。 */
export interface FormRules { [name: string]: readonly FormRule[] | readonly FormRules[] | FormRules }

export interface FormProps {
  /** 由字段控件双向绑定的响应式数据对象。 */
  data?: Record<string, any>
  /** 表单统一的字段校验规则。 */
  rules?: FormRules
  /** 各类规则的默认提示模板。 */
  errorMessage?: FormErrorMessage
  /** 表单项排列方式。 */
  layout?: 'vertical' | 'inline'
  /** 标签文字的位置。 */
  labelAlign?: 'left' | 'right' | 'top'
  /** 标签宽度，数值以像素为单位，零隐藏标签。 */
  labelWidth?: string | number
  /** 标签后显示冒号。 */
  colon?: boolean
  /** 是否显示必填标记，省略时根据规则判断。 */
  requiredMark?: boolean
  /** 必填标记位于标签的哪一侧。 */
  requiredMarkPosition?: 'left' | 'right'
  /** 是否显示校验反馈。 */
  showErrorMessage?: boolean
  /** 是否显示校验结果图标。 */
  statusIcon?: boolean
  /** 禁用表单内的 Ym 控件。 */
  disabled?: boolean
  /** 将表单内的字段设为只读。 */
  readonly?: boolean
  /** 重置为空值或字段挂载时的初始值。 */
  resetType?: FormResetType
  /** 阻止原生表单提交和重置的默认行为。 */
  preventSubmitDefault?: boolean
  /** 校验后滚动到首个错误字段时的滚动方式。 */
  scrollToFirstError?: '' | 'auto' | 'smooth'
  /** 表单及其内部控件的尺寸。 */
  size?: ControlSize
}

export interface FormItemProps {
  /** 字段路径，例如 contacts[0].name。 */
  name?: string
  /** 标签名称。 */
  label?: string
  /** 关联控件的 HTML id。 */
  for?: string
  /** 标签的位置，优先于表单设置。 */
  labelAlign?: FormProps['labelAlign']
  /** 标签宽度，优先于表单设置。 */
  labelWidth?: FormProps['labelWidth']
  /** 字段专属规则，优先于表单规则。 */
  rules?: readonly FormRule[]
  /** 是否显示必填标记。 */
  requiredMark?: boolean
  /** 是否显示校验反馈。 */
  showErrorMessage?: boolean
  /** 手动指定字段状态。 */
  status?: FormStatus
  /** 是否显示校验结果图标。 */
  statusIcon?: boolean
  /** 校验通过时显示成功色边框。 */
  successBorder?: boolean
  /** 持续显示的字段说明。 */
  help?: string
  /** 自定义状态提示。 */
  tips?: string
}

export interface FormStatusIconScope {
  /** 当前字段的校验状态。 */
  status?: FormStatus
  /** 当前字段的路径。 */
  name: string
}
export interface FormItemMessage {
  /** 反馈的语义类型。 */
  type: FormStatus
  /** 反馈内容。 */
  message: string
}
export interface FormValidateOptions {
  /** 只校验指定的已注册字段路径。 */
  fields?: readonly string[]
  /** 只执行匹配触发方式的规则。 */
  trigger?: FormValidateTrigger
  /** 本次校验是否显示反馈。 */
  showErrorMessage?: boolean
}
export interface FormResetOptions {
  /** 只重置指定的已注册字段路径。 */
  fields?: readonly string[]
  /** 覆盖表单的重置方式。 */
  type?: FormResetType
}
export interface FormValidateContext {
  /** 校验通过为 true，失败时按字段返回规则结果。 */
  validateResult: FormValidateResult
  /** 按字段的文档顺序返回首条失败提示。 */
  firstError: string
}
export interface FormSubmitContext extends FormValidateContext {
  /** 原生提交事件。 */
  e: SubmitEvent
}
export interface FormInstance {
  /** 校验字段、更新反馈并触发 validate。 */
  validate(options?: FormValidateOptions): Promise<FormValidateResult>
  /** 校验字段并返回结果，无界面与事件副作用。 */
  validateOnly(options?: Omit<FormValidateOptions, 'showErrorMessage'>): Promise<FormValidateResult>
  /** 发起原生提交流程，等待校验和提交事件。 */
  submit(options?: Pick<FormValidateOptions, 'showErrorMessage'>): Promise<void>
  /** 重置数据和校验状态。 */
  reset(options?: FormResetOptions): void
  /** 清除校验反馈，保留字段值。 */
  clearValidate(fields?: readonly string[]): void
  /** 写入由服务端或业务逻辑返回的提示。 */
  setValidateMessage(messages: Record<string, readonly FormItemMessage[]>): void
}
