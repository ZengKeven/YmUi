import { computed, onActivated, onDeactivated, onMounted, onScopeDispose, ref, watch, type Ref } from 'vue'
import type { SwiperChangeSource, SwiperProps } from './types'

function clampIndex(index: number, count: number) {
  if (count === 0 || !Number.isFinite(index)) return 0
  return Math.max(0, Math.min(Math.trunc(index), count - 1))
}

export function useSwiperPlayback(props: Readonly<SwiperProps>, count: Readonly<Ref<number>>,
  notify: (index: number, source: SwiperChangeSource) => void) {
  const local = ref(props.current ?? props.defaultCurrent ?? 0)
  const current = computed(() => clampIndex(props.current ?? local.value, count.value))
  const hovering = ref(false)
  const focused = ref(false)
  const active = ref(false)
  const hidden = ref(false)
  const reducedMotion = ref(false)
  const interval = computed(() => props.interval ?? 5000)
  const playing = computed(() => active.value && props.autoplay !== false && count.value > 1 &&
    Number.isFinite(interval.value) && interval.value > 0 && !hidden.value && !reducedMotion.value && !focused.value &&
    !(props.stopOnHover !== false && hovering.value) && (props.loop !== false || current.value < count.value - 1))
  let timer: number | undefined
  let preference: MediaQueryList | undefined

  // 子项数量变化时保留合法位置，退出受控模式时沿用最后收到的页码。
  watch([count, () => props.current], ([length, value], [, previous]) => {
    local.value = clampIndex(value ?? previous ?? local.value, length)
  })

  function clearTimer() {
    if (timer !== undefined) window.clearTimeout(timer)
    timer = undefined
  }

  function schedule() {
    clearTimer()
    if (playing.value) {
      timer = window.setTimeout(() => {
        if (playing.value) step(1, 'autoplay')
      }, interval.value)
    }
  }

  function select(index: number, source: SwiperChangeSource) {
    const next = clampIndex(index, count.value)
    if (count.value < 2 || next === current.value) return
    if (props.current === undefined) local.value = next
    notify(next, source)
    // 即使受控父组件保留原页码，也要等完整间隔再请求下一页。
    schedule()
  }

  function step(delta: number, source: SwiperChangeSource) {
    const length = count.value
    if (length < 2) return
    const next = current.value + delta
    select(props.loop === false ? next : ((next % length) + length) % length, source)
  }

  watch([playing, current, count, interval], schedule)
  const syncVisibility = () => { hidden.value = document.hidden }
  const syncMotion = () => { reducedMotion.value = preference?.matches ?? false }
  onMounted(() => {
    preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener('change', syncMotion)
    document.addEventListener('visibilitychange', syncVisibility)
    syncVisibility()
    syncMotion()
    active.value = true
  })
  onActivated(() => { active.value = true })
  onDeactivated(() => {
    active.value = false
    hovering.value = false
    focused.value = false
    clearTimer()
  })
  onScopeDispose(() => {
    active.value = false
    clearTimer()
    if (preference) {
      preference.removeEventListener('change', syncMotion)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  })

  return { current, select, step, hovering, focused, playing, reducedMotion }
}
