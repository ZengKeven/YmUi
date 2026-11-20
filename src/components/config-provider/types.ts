import type { HTMLAttributes } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type ControlSize = 'extra-small' | 'small' | 'medium' | 'large'

export interface ThemeColors {
  primary?: string
  success?: string
  warning?: string
  danger?: string
  surface?: string
  text?: string
  border?: string
  onAccent?: string
}

export interface ConfigProviderProps extends /* @vue-ignore */ HTMLAttributes {
  mode?: ThemeMode
  theme?: { light?: ThemeColors; dark?: ThemeColors }
  size?: ControlSize
  radius?: number | string
}
