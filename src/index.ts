import { version as packageVersion } from '../package.json'

export { YmButton, type ButtonProps } from './components/button'
export { YmIcon, type IconName, type IconProps } from './components/icon'
export { YmLayout, type LayoutProps } from './components/layout'
export { YmLoading, type LoadingProps } from './components/loading'
export { YmMenu, type MenuItem, type MenuLeaf, type MenuProps, type MenuValue } from './components/menu'
export { YmPagination, type PageInfo, type PaginationProps } from './components/pagination'
export { YmSpace, type SpaceProps, type SpaceSize } from './components/space'
export { YmSteps, type StepOption, type StepsProps, type StepStatus, type StepValue } from './components/steps'
export { default as ConfigProvider } from './components/config-provider/ConfigProvider.vue'
export type { ConfigProviderProps, ControlSize, ThemeColors, ThemeMode } from './components/config-provider/types'

export const version = packageVersion
