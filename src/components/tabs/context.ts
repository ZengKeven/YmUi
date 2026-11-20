import type { InjectionKey, Ref } from 'vue'
import type { TabPanelProps, TabValue } from './types'

export const tabsKey: InjectionKey<{
  tablist: Readonly<Ref<HTMLElement | null>>
  actions: Readonly<Ref<HTMLElement | null>>
  active: Readonly<Ref<TabValue | undefined>>
  register: (panel: TabPanelProps) => () => void
  select: (value: TabValue) => void
}> = Symbol('YmTabs')
