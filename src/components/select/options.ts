import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import type { SelectOption, SelectProps } from './types'

export function useSelectOptions(props: Readonly<SelectProps>, open: Ref<boolean>, query: Ref<string>) {
  const remoteOptions = shallowRef<readonly SelectOption[]>([])
  const status = ref<'ready' | 'loading' | 'error'>('ready')
  watch([open, query, () => props.remoteMethod], async ([visible, keyword, search], _, onCleanup) => {
    status.value = 'ready'
    if (!visible || !search) return
    const controller = new AbortController()
    onCleanup(() => controller.abort())
    remoteOptions.value = []
    status.value = 'loading'
    try {
      const result = await search(keyword, controller.signal)
      if (!controller.signal.aborted) {
        remoteOptions.value = result
        status.value = 'ready'
      }
    } catch {
      if (!controller.signal.aborted) status.value = 'error'
    }
  })
  const options = computed(() => {
    if (props.remoteMethod) return remoteOptions.value
    const all = props.options ?? []
    if (!query.value) return all
    const filter = props.filter
    if (filter) return all.filter(option => filter(query.value, option))
    const keyword = query.value.trim().toLocaleLowerCase()
    return all.filter(option => option.label.toLocaleLowerCase().includes(keyword))
  })
  return { options, remoteOptions, status }
}
