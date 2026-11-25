import type { ProgressColor } from './types'

interface ColorStop {
  offset: number
  color: string
}

interface ResolvedColor {
  stops: ColorStop[]
  solid?: string
  background?: string
}

function getOffset(position: string) {
  if (position === 'from') return 0
  if (position === 'to') return 100
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)%$/.test(position)) return undefined
  const percent = Number.parseFloat(position)
  return percent <= 100 ? percent : undefined
}

export function resolveProgressColor(color?: ProgressColor): ResolvedColor {
  if (!color) return { stops: [] }
  if (typeof color === 'string') {
    const solid = color.trim()
    return solid ? { solid, background: solid, stops: [] } : { stops: [] }
  }

  let stops: ColorStop[]
  if (Array.isArray(color)) {
    const colors = color.map(value => value.trim()).filter(Boolean)
    stops = colors.map((value, index) => ({
      color: value,
      offset: (index * 100) / Math.max(colors.length - 1, 1),
    }))
  } else {
    stops = []
    for (const [position, value] of Object.entries(color)) {
      const offset = getOffset(position.trim())
      const stopColor = value.trim()
      if (offset !== undefined && stopColor) stops.push({ offset, color: stopColor })
    }
    stops.sort((a, b) => a.offset - b.offset)
  }

  if (stops.length === 0) return { stops }
  if (stops.length === 1) {
    const solid = stops[0].color
    return { solid, background: solid, stops: [] }
  }
  const sequence = stops.map(stop => `${stop.color} ${stop.offset}%`).join(', ')
  return { stops, background: `linear-gradient(to right, ${sequence})` }
}
