import type { ComponentObjectPropsOptions, PropType } from 'vue'
import buttonProps from '../button/props'
import type { TagProps } from './types'

export default {
  /** 标签正文，默认插槽优先。 */
  content: String,
  /** 语义色，默认使用中性色。 */
  theme: { ...buttonProps.theme, default: 'default' },
  /** 底色和边框样式。 */
  variant: {
    type: String as PropType<TagProps['variant']>, default: 'dark',
    validator: (value: string) => ['dark', 'light', 'outline', 'light-outline'].includes(value),
  },
  /** 标签轮廓，默认直角。 */
  shape: {
    type: String as PropType<TagProps['shape']>, default: 'square',
    validator: (value: string) => ['square', 'round', 'mark'].includes(value),
  },
  /** 包含图标和关闭按钮在内的最大宽度。 */
  maxWidth: [String, Number] as PropType<TagProps['maxWidth']>,
  /** 标签尺寸，默认继承最近的 ConfigProvider。 */
  size: buttonProps.size,
  /** 是否显示移除按钮。 */
  closable: Boolean,
  /** 移除按钮的无障碍名称。 */
  closeLabel: String,
  /** 是否禁用移除操作。 */
  disabled: Boolean,
} satisfies ComponentObjectPropsOptions<TagProps>
