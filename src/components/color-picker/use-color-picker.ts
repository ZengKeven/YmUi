import { computed, ref, shallowRef, watch } from 'vue'
import type { ColorPickerPanelProps } from './types'

type ModelFields = { modelValue?: string | false; value?: string | false; defaultValue?: string }

export function useColorValue(props: ModelFields, sync: (event: 'update:modelValue' | 'update:value', value: string) => void) {
  const local = ref(props.defaultValue ?? '')
  const external = computed(() => {
    if (props.modelValue !== false) return props.modelValue ?? ''
    if (props.value !== false) return props.value ?? ''
    return undefined
  })
  const value = computed(() => external.value ?? local.value)
  function changeValue(next: string) {
    if (props.modelValue !== false) sync('update:modelValue', next)
    else if (props.value !== false) sync('update:value', next)
    else local.value = next
  }
  return { external, value, changeValue }
}

export function useRecentColors(props: Pick<ColorPickerPanelProps, 'recentColors' | 'defaultRecentColors'>, publish: (colors: string[]) => void) {
  const local = shallowRef<readonly string[]>(Array.isArray(props.defaultRecentColors) ? [...props.defaultRecentColors] : [])
  watch(() => Array.isArray(props.recentColors) ? [...props.recentColors] : props.recentColors, (next, previous) => {
    if (Array.isArray(next) && (next.length || Array.isArray(previous))) local.value = [...next]
  }, { immediate: true })
  const recent = computed(() => {
    const setting = props.recentColors === undefined ? props.defaultRecentColors : props.recentColors
    if (setting === false || setting === null) return false
    return Array.isArray(props.recentColors) && props.recentColors.length ? props.recentColors : local.value
  })
  function changeRecent(colors: string[]) {
    if (recent.value === false) return
    local.value = colors
    publish(colors)
  }
  return { recent, changeRecent }
}
