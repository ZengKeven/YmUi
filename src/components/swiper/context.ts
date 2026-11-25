import type { InjectionKey, Ref } from 'vue'

export const swiperKey: InjectionKey<{
  items: Readonly<Ref<readonly HTMLElement[]>>
  current: Readonly<Ref<number>>
  loop: Readonly<Ref<boolean>>
}> = Symbol('YmSwiper')
