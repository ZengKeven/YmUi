import type { SelectKey, SelectProps } from '../select'

export type TreeSelectValue<Key extends SelectKey = SelectKey> = Key | Key[] | null

export interface TreeSelectOption<Key extends SelectKey = SelectKey> {
  /** 整棵树中唯一的节点值。 */
  value: Key
  /** 节点名称，也是本地过滤使用的文字。 */
  label: string
  /** 仅禁止选中或移除当前节点，子节点仍按各自的配置处理。 */
  disabled?: boolean
  /** 当前节点下的本地子节点。 */
  children?: readonly TreeSelectOption<Key>[]
}

export interface TreeSelectProps<Key extends SelectKey = SelectKey> extends
  Pick<SelectProps, 'size' | 'disabled' | 'placeholder' | 'name' | 'form' | 'class' | 'style'> {
  /** 树形选项。 */
  options?: readonly TreeSelectOption<Key>[]
  /** 当前选中值，支持 v-model。 */
  modelValue?: TreeSelectValue<Key>
  /** 非受控时的初始选中值。 */
  defaultValue?: TreeSelectValue<Key>
  /** 是否可同时选择多个节点，父子节点独立选择。 */
  multiple?: boolean
  /** 允许输入名称过滤，并显示匹配节点的祖先。 */
  filterable?: boolean
  /** 禁止选择的层级，根节点为第 1 层。 */
  disabledLevels?: readonly number[]
}
