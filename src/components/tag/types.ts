import type { ButtonProps } from '../button'
import type { ControlSize } from '../config-provider/types'

export interface TagProps {
  /** 标签文字，默认插槽优先。 */
  content?: string
  /** 标签的语义色。 */
  theme?: ButtonProps['theme']
  /** 标签底色和边框的样式。 */
  variant?: 'dark' | 'light' | 'outline' | 'light-outline'
  /** 标签尺寸，省略时继承全局配置。 */
  size?: ControlSize
  /** 是否显示移除按钮。 */
  closable?: boolean
  /** 移除按钮的无障碍名称，默认由「移除」和标签正文组成。 */
  closeLabel?: string
  /** 是否禁用移除操作。 */
  disabled?: boolean
}
