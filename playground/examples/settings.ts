import { reactive } from 'vue'
import type { ControlSize, ThemeMode } from '../../src'

const defaults = getComputedStyle(document.documentElement)
export const settings = reactive({
  mode: 'auto' as ThemeMode,
  size: 'medium' as ControlSize,
  radius: 6,
  lightPrimary: defaults.getPropertyValue('--ym-light-primary').trim(),
  darkPrimary: defaults.getPropertyValue('--ym-dark-primary').trim(),
})

export const sizes = [['extra-small', '特小'], ['small', '小'], ['medium', '中'], ['large', '大']] as const
