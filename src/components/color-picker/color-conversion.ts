import { colorNames } from './color-names'

export interface Hsva { h: number; s: number; v: number; a: number }
export type Rgba = { r: number; g: number; b: number; a: number }

export const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value))
const unit = (value: number) => clamp(value, 1)
const degrees = (value: number) => ((value % 360) + 360) % 360

export function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const channel = (offset: number) => {
    const k = (offset + h / 60) % 6
    return Math.round(255 * v * (1 - s * Math.max(0, Math.min(k, 4 - k, 1))))
  }
  return { r: channel(5), g: channel(3), b: channel(1), a }
}

function rgbToHsv(r: number, g: number, b: number, a: number): Hsva {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta > 0) {
    if (max === r) h = (g - b) / delta
    else if (max === g) h = 2 + (b - r) / delta
    else h = 4 + (r - g) / delta
  }
  return { h: degrees(h * 60), s: max ? delta / max : 0, v: max / 255, a }
}

export function hsvToHsl({ h, s, v, a }: Hsva) {
  const l = v * (1 - s / 2)
  const saturation = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)
  return { h: Math.round(h), s: Math.round(100 * saturation), l: Math.round(100 * l), a }
}

export function rgbToCmyk({ r, g, b }: Rgba) {
  const max = Math.max(r, g, b)
  const ink = (channel: number) => max ? Math.round(100 * (1 - channel / max)) : 0
  return { c: ink(r), m: ink(g), y: ink(b), k: Math.round(100 * (1 - max / 255)) }
}

const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/
function component(token: string, scale: number): number {
  const percent = token.endsWith('%')
  const number = percent ? token.slice(0, -1) : token
  return numeric.test(number) ? clamp(Number(number) * (percent ? scale / 100 : 1), scale) : NaN
}

export function parseAngle(token: string): number {
  const match = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(deg|turn|grad|rad)?$/.exec(token)
  if (!match) return NaN
  const scale = match[2] === 'turn' ? 360 : match[2] === 'rad' ? 180 / Math.PI : match[2] === 'grad' ? 0.9 : 1
  const angle = Number(match[1]) * scale
  return angle === 360 ? angle : degrees(angle)
}

const hexPattern = /^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/
export function parseSolid(input: string): Hsva | undefined {
  let value = input.trim().toLowerCase()
  if (Object.hasOwn(colorNames, value)) value = colorNames[value]
  const hex = hexPattern.exec(value)?.[1]
  if (hex) {
    const pairs = hex.length < 5 ? Array.from(hex, digit => digit + digit).join('') : hex
    const channel = (i: number) => parseInt(pairs.slice(i, i + 2), 16)
    return rgbToHsv(channel(0), channel(2), channel(4), pairs.length === 8 ? channel(6) / 255 : 1)
  }
  const fn = /^(rgb|rgba|hsl|hsla|hsv|hsva|cmyk)\(([^()]*)\)$/.exec(value)
  if (!fn) return
  const body = fn[2].trim()
  const tokens = body.includes(',') ? body.split(/\s*,\s*/) : body.replace(/\s*\/\s*/g, ' ').split(/\s+/)
  if (fn[1] === 'cmyk') {
    if (tokens.length !== 4) return
    const channels = tokens.map(token => component(token, 100) / 100)
    if (!channels.every(Number.isFinite)) return
    const [c, m, y, k] = channels
    const rgb = (ink: number) => (1 - ink) * (1 - k) * 255
    return rgbToHsv(rgb(c), rgb(m), rgb(y), 1)
  }
  if (tokens.length !== 3 && tokens.length !== 4) return
  const alpha = tokens.length === 4 ? component(tokens[3], 1) : 1
  if (!Number.isFinite(alpha)) return
  if (fn[1].startsWith('rgb')) {
    const [r, g, b] = tokens.slice(0, 3).map(token => component(token, 255))
    if ([r, g, b].every(Number.isFinite)) return rgbToHsv(r, g, b, alpha)
    return
  }
  const h = parseAngle(tokens[0])
  const s = component(tokens[1], 100) / 100
  const third = component(tokens[2], 100) / 100
  if (![h, s, third].every(Number.isFinite)) return
  if (fn[1].startsWith('hsv')) return { h, s, v: third, a: alpha }
  const v = third + s * Math.min(third, 1 - third)
  return { h, s: v ? unit(2 * (1 - third / v)) : 0, v, a: alpha }
}
