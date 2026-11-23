import type { HTMLAttributes } from 'vue'
import type { SelectKey } from '../select'
import TreeSelect from './tree-select.vue'
import type { TreeSelectProps } from './types'

export type { TreeSelectOption, TreeSelectProps, TreeSelectValue } from './types'

type TreeSelectComponent = <Key extends SelectKey = SelectKey, Multiple extends boolean = false>(
  props: TreeSelectProps<Key> & { multiple?: Multiple }
    & Omit<Parameters<typeof TreeSelect<Key, Multiple>>[0], keyof TreeSelectProps>
    & Omit<HTMLAttributes, keyof TreeSelectProps | 'onChange'>,
) => ReturnType<typeof TreeSelect<Key, Multiple>>

export const YmTreeSelect = TreeSelect as TreeSelectComponent
export default YmTreeSelect
