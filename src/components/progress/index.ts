import Progress from './progress.vue'
import type { ProgressProps } from './types'

export type { ProgressColor, ProgressProps, ProgressStatus, ProgressTheme } from './types'

// 原生 color 属性只接受字符串，此处保留组件的渐变类型和其余透传属性。
type ProgressComponent = (
  props: Omit<Parameters<typeof Progress>[0], 'color'> & Pick<ProgressProps, 'color'>,
) => ReturnType<typeof Progress>
export const YmProgress = Progress as ProgressComponent
export default YmProgress
