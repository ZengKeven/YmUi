import { computed, onMounted, onScopeDispose, ref, watch } from 'vue'
import type { StatisticProps } from './types'

function finiteValue(value = 0) {
  return Number.isFinite(value) ? value : 0
}

export function useStatisticAnimation(props: Readonly<StatisticProps>) {
  const target = computed(() => finiteValue(props.value))
  const origin = computed(() => finiteValue(props.animation?.valueFrom))
  const duration = computed(() => {
    const ms = props.animation?.duration ?? 200
    return Number.isFinite(ms) ? ms : 200
  })
  const enabled = computed(() => Boolean(props.animation))
  const displayValue = ref(enabled.value ? origin.value : target.value)
  let frame: number | undefined
  let preference: MediaQueryList | undefined
  let mounted = false

  function stop() {
    if (frame !== undefined) cancelAnimationFrame(frame)
    frame = undefined
  }

  function finish() {
    stop()
    displayValue.value = target.value
  }

  function onMotionChange(event: MediaQueryListEvent) {
    if (event.matches && frame !== undefined) finish()
  }

  function animate(from: number) {
    stop()
    const to = target.value
    const ms = duration.value
    if (!mounted || !enabled.value || ms <= 0 || from === to) {
      displayValue.value = to
      return
    }
    if (!preference) {
      preference = window.matchMedia('(prefers-reduced-motion: reduce)')
      preference.addEventListener('change', onMotionChange)
    }
    if (preference.matches) {
      displayValue.value = to
      return
    }

    displayValue.value = from
    const began = performance.now()
    function tick(now: number) {
      const elapsed = Math.max(0, now - began)
      if (elapsed >= ms) {
        displayValue.value = to
        frame = undefined
        return
      }
      // 四次缓出。分别乘以权重也能处理跨过零的两个极大值。
      const remaining = (1 - elapsed / ms) ** 4
      displayValue.value = from * remaining + to * (1 - remaining)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  const start = () => animate(origin.value)

  watch([enabled, () => Boolean(props.animationStart), target, origin, duration],
    ([configured, auto, to, from, ms], [wasConfigured, wasAuto, lastTarget, lastOrigin, lastDuration]) => {
      if (!configured || (wasAuto && !auto)) {
        finish()
      } else if (!wasConfigured || (auto && !wasAuto)) {
        if (auto) start()
        else displayValue.value = from
      } else if (to !== lastTarget || (frame !== undefined && ms !== lastDuration)) {
        if (frame !== undefined || auto) animate(displayValue.value)
        else displayValue.value = to
      } else if (from !== lastOrigin && !auto && frame === undefined) {
        displayValue.value = from
      }
    })

  onMounted(() => {
    mounted = true
    if (enabled.value && props.animationStart) start()
  })
  onScopeDispose(() => {
    mounted = false
    stop()
    preference?.removeEventListener('change', onMotionChange)
  })

  return { displayValue, start }
}
