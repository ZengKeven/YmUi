import Switch from './switch.vue'
import type { SwitchProps, SwitchValue } from './types'

export type { SwitchProps, SwitchValue } from './types'

// 开启和关闭值可以不同类型，两个值共同决定事件及标签插槽的类型。
type SwitchComponent = <Values extends readonly [SwitchValue, SwitchValue] = [true, false]>(
  props: { customValue?: Values } & Omit<SwitchProps, 'customValue'>
    & Omit<Parameters<typeof Switch<Values[number]>>[0], keyof SwitchProps>,
) => ReturnType<typeof Switch<Values[number]>>

export const YmSwitch = Switch as SwitchComponent
export default YmSwitch
