import type { InputProps } from '../input'

export type SelectKey = string | number
export type SelectValue = SelectKey | SelectKey[] | null

export interface SelectOption {
  /** 在当前选择器中唯一的值。 */
  value: SelectKey
  /** 默认显示及过滤时使用的文字。 */
  label: string
  /** 禁用该选项。 */
  disabled?: boolean
  /** 可在自定义选项插槽中读取的业务字段。 */
  [field: string]: any
}

export interface SelectProps<Option extends SelectOption = SelectOption> extends Pick<InputProps, 'size' | 'placeholder' | 'disabled' | 'class' | 'style' | 'name' | 'form'> {
  /** 当前选中值，支持 v-model。 */
  modelValue?: SelectValue
  /** 未受控时的初始选中值。 */
  defaultValue?: SelectValue
  /** 候选项，远程搜索时也可用于回显初始选中项。 */
  options?: readonly Option[]
  /** 是否允许选择多个值。 */
  multiple?: boolean
  /** 多选数量上限，0 表示不限。 */
  max?: number
  /** 允许按选项名称过滤。 */
  filterable?: boolean
  /** 自定义本地过滤规则，返回 true 时保留选项。 */
  filter?(query: string, option: Option): boolean
  /** 按关键词加载远程选项，可使用 signal 取消过期请求。 */
  remoteMethod?: (query: string, signal: AbortSignal) => readonly Option[] | Promise<readonly Option[]>
}
