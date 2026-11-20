import type { InputHTMLAttributes } from 'vue'
import InputNumber from './input-number.vue'

export type { InputNumberProps } from './types'

type Props = Parameters<typeof InputNumber>[0]
type NativeAttrs = Omit<InputHTMLAttributes, keyof Props | 'type' | 'inputmode' | 'step'>
// 原生输入属性透传给 YmInput，数值属性和事件使用数字输入框自己的类型。
type WithNativeAttrs = (props: Props & NativeAttrs) => ReturnType<typeof InputNumber>
export const YmInputNumber: typeof InputNumber & WithNativeAttrs = InputNumber
export default YmInputNumber
