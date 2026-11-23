import type { ComponentObjectPropsOptions, PropType } from 'vue'
import inputProps from '../input/props'
import type { SwitchProps, SwitchValue } from './types'

const valueProp = { type: [String, Number, Boolean] as PropType<SwitchValue>, default: undefined }

export default {
  /** 当前双向绑定值。 */
  modelValue: valueProp,
  /** 受控值，modelValue 优先。 */
  value: valueProp,
  /** 未受控时的初始值。 */
  defaultValue: valueProp,
  /** 开启值和关闭值，默认为布尔值。 */
  customValue: {
    type: Array as unknown as PropType<NonNullable<SwitchProps['customValue']>>,
    default: () => [true, false],
    validator: (values: readonly SwitchValue[]) => values.length === 2 && values[0] !== values[1],
  },
  /** 轨道内的文字，支持按开启与关闭状态分别设置。 */
  label: [String, Array] as PropType<SwitchProps['label']>,
  /** 返回布尔值或 Promise 的切换前校验函数。 */
  beforeChange: Function as PropType<SwitchProps['beforeChange']>,
  /** 是否禁止操作。 */
  disabled: Boolean,
  /** 是否正在加载。 */
  loading: Boolean,
  /** 局部尺寸，默认继承。 */
  size: inputProps.size,
} satisfies ComponentObjectPropsOptions<SwitchProps>
