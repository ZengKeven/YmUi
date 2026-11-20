import type { PublicProps } from 'vue'
import ButtonComponent from './button.vue'
import type { ButtonProps } from './type'

export type { ButtonProps } from './type'

type ButtonPublicProps = PublicProps & ButtonProps

// 按已有键展开属性，使公共签名兼容 Vue 的透传属性检查，并保留原生属性提示。
type ButtonWithAttrs = (
  props: { [K in keyof ButtonPublicProps]: ButtonPublicProps[K] },
) => ReturnType<typeof ButtonComponent>
export const YmButton: typeof ButtonComponent & ButtonWithAttrs = ButtonComponent

export default YmButton
