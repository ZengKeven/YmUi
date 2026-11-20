import type { ComponentObjectPropsOptions, PropType } from 'vue'
import type { IconProps } from './types'

export default {
  /** 内置图标名称。 */
  name: { type: String as PropType<IconProps['name']>, required: true },
  /** 图标尺寸，接受预设尺寸、CSS 长度或像素数值。 */
  size: [String, Number] as PropType<IconProps['size']>,
  /** 图标颜色，默认继承文字颜色。 */
  color: String,
  /** 点击图标时触发，e 为原生鼠标事件。 */
  onClick: Function as PropType<IconProps['onClick']>,
} satisfies ComponentObjectPropsOptions<IconProps>
