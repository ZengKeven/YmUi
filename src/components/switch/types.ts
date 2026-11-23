import type { ControlSize } from '../config-provider/types'

export type SwitchValue = boolean | string | number

export interface SwitchProps<Value extends SwitchValue = SwitchValue> {
  /** 当前值，支持 v-model。 */
  modelValue?: Value
  /** 外部控制的值，modelValue 优先。 */
  value?: Value
  /** 非受控开关的初始值，默认取关闭值。 */
  defaultValue?: Value
  /** 开启和关闭时对应的值。 */
  customValue?: readonly [Value, Value]
  /** 轨道内的文字，可分别指定开启和关闭时的文案。 */
  label?: string | readonly [string, string]
  /** 切换前校验，返回 true 或兑现为 true 时允许切换。 */
  beforeChange?: () => boolean | Promise<boolean>
  /** 是否禁用开关。 */
  disabled?: boolean
  /** 是否显示加载指示并暂停切换。 */
  loading?: boolean
  /** 开关尺寸，省略时继承全局配置。 */
  size?: ControlSize
}
