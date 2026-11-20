import { version as packageVersion } from '../package.json'

export { YmButton, type ButtonProps } from './components/button'
export { YmIcon, type IconName, type IconProps } from './components/icon'
export { YmLayout, type LayoutProps } from './components/layout'
export { YmLoading, type LoadingProps } from './components/loading'
export { YmSpace, type SpaceProps, type SpaceSize } from './components/space'
export { default as ConfigProvider } from './components/config-provider/ConfigProvider.vue'
export type { ConfigProviderProps, ControlSize, ThemeColors, ThemeMode } from './components/config-provider/types'

export const version = packageVersion
