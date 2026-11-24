import { clamp, hsvToRgb, parseAngle, parseSolid } from './color-conversion'

export interface GradientColorPoint { id: string; left: number; color: string }
interface Gradient { points: Omit<GradientColorPoint, 'id'>[]; degree: number }

let nextPointId = 0
export function genGradientPoint(left: number, color: string, id?: string): GradientColorPoint {
  return { id: id ?? `stop-${++nextPointId}`, left: clamp(left, 100), color }
}

const directions: Record<string, number> = {
  top: 0, 'top right': 45, 'right top': 45, right: 90, 'bottom right': 135, 'right bottom': 135,
  bottom: 180, 'bottom left': 225, 'left bottom': 225, left: 270, 'top left': 315, 'left top': 315,
}

function splitStops(body: string) {
  const tokens: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '(') depth++
    else if (body[i] === ')') depth--
    else if (body[i] === ',' && depth === 0) {
      tokens.push(body.slice(start, i).trim())
      start = i + 1
    }
    if (depth < 0) return []
  }
  if (depth !== 0) return []
  tokens.push(body.slice(start).trim())
  return tokens
}

export function parseGradient(input: string): Gradient | undefined {
  const gradient = /^linear-gradient\(([\s\S]+)\);?$/i.exec(input.trim())
  if (!gradient) return
  const tokens = splitStops(gradient[1])
  if (tokens.length < 2) return
  const first = tokens[0].toLowerCase()
  let degree = 180
  if (first.startsWith('to ')) {
    const direction = first.slice(3).trim().replace(/\s+/g, ' ')
    if (!Object.hasOwn(directions, direction)) return
    degree = directions[direction]
    tokens.shift()
  } else if (/^[+-]?(?:\d|\.)/.test(first) && Number.isFinite(parseAngle(first))) {
    degree = parseAngle(first)
    tokens.shift()
  }
  if (tokens.length < 2) return
  const points: Gradient['points'] = []
  for (const token of tokens) {
    const position = /\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))%$/.exec(token)
    const color = parseSolid(position ? token.slice(0, position.index) : token)
    if (!color) return
    const { r, g, b, a } = hsvToRgb(color)
    const css = a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`
    points.push({ color: css, left: position ? clamp(Number(position[1]), 100) : NaN })
  }

  // 首末色标缺省时固定在两端，中间连续省略的位置在相邻已定位色标间等分。
  const last = points.length - 1
  if (Number.isNaN(points[0].left)) points[0].left = 0
  if (Number.isNaN(points[last].left)) points[last].left = 100
  let anchor = 0
  for (let i = 1; i <= last; i++) {
    if (Number.isNaN(points[i].left)) continue
    points[i].left = Math.max(points[anchor].left, points[i].left)
    const step = (points[i].left - points[anchor].left) / (i - anchor)
    for (let j = anchor + 1; j < i; j++) points[j].left = points[anchor].left + step * (j - anchor)
    anchor = i
  }
  return { degree, points }
}

export function gradientColors2string({ points, degree }: Gradient) {
  const stops = [...points].sort((a, b) => a.left - b.left)
    .map(point => `${point.color} ${Math.round(point.left * 100) / 100}%`)
  return `linear-gradient(${degree}deg,${stops.join(',')})`
}
