import type { HTMLAttributes } from 'vue'
import Select from './select.vue'
import type { SelectOption, SelectProps } from './types'

export type { SelectKey, SelectOption, SelectProps, SelectValue } from './types'

// 从候选项及多选开关推导选中值和插槽类型，并保留原生属性的提示。
type SelectComponent = <Option extends SelectOption = SelectOption, Multiple extends boolean = false>(
  props: SelectProps<Option> & { multiple?: Multiple }
    & Omit<Parameters<typeof Select<Option, Multiple>>[0], keyof SelectProps>
    & Omit<HTMLAttributes, keyof SelectProps | 'onChange'>,
) => ReturnType<typeof Select<Option, Multiple>>
export const YmSelect = Select as SelectComponent
export default YmSelect
