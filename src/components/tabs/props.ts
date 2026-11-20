import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { TabPanelProps, TabsProps } from './types'

export default {
  /** 当前面板标识，支持 v-model。 */
  modelValue: [String, Number] as PropType<TabsProps['modelValue']>,
  /** 标签尺寸，默认继承全局配置。 */
  size: {
    type: String as PropType<TabsProps['size']>,
    validator: (value: string) => ['extra-small', 'small', 'medium', 'large'].includes(value),
  },
} satisfies ComponentObjectPropsOptions<TabsProps>

export const tabPanelProps = {
  /** 面板在当前选项卡内的唯一标识。 */
  value: { type: [String, Number] as PropType<TabPanelProps['value']>, required: true },
  /** 标签标题，默认显示面板标识。 */
  label: String,
} satisfies ComponentObjectPropsOptions<TabPanelProps>
