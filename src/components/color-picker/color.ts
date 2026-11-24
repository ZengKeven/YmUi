import { clamp, hsvToHsl, hsvToRgb, parseSolid, rgbToCmyk, type Hsva } from './color-conversion'
import { genGradientPoint, gradientColors2string, parseGradient, type GradientColorPoint } from './gradient'
import type { ColorFormat, ColorObject } from './types'

export { genGradientPoint, gradientColors2string, type GradientColorPoint }
export type { ColorFormat }

export const DEFAULT_COLOR = '#001F97'
export const DEFAULT_LINEAR_GRADIENT = 'linear-gradient(90deg, rgba(241,29,0,1) 0%, rgba(73,106,220,1) 100%)'
// TDesign 的四组系统色（MIT，许可文本随包中的 LICENSE-TDesign-Icons 分发）。
export const DEFAULT_SYSTEM_SWATCH_COLORS = [
  '#ECF2FE', '#D4E3FC', '#BBD3FB', '#96BBF8', '#699EF5', '#4787F0', '#266FE8', '#0052D9', '#0034B5', '#001F97',
  '#FDECEE', '#F9D7D9', '#F8B9BE', '#F78D94', '#F36D78', '#E34D59', '#C9353F', '#B11F26', '#951114', '#680506',
  '#FEF3E6', '#F9E0C7', '#F7C797', '#F2995F', '#ED7B2F', '#D35A21', '#BA431B', '#9E3610', '#842B0B', '#5A1907',
  '#E8F8F2', '#BCEBDC', '#85DBBE', '#48C79C', '#00A870', '#078D5C', '#067945', '#056334', '#044F2A', '#033017',
]

const formats = ['HEX', 'RGB', 'HSL', 'HSV', 'CMYK', 'CSS'] as const
const alphaFormats: Partial<Record<ColorFormat, ColorFormat>> = { HEX: 'HEX8', RGB: 'RGBA', HSL: 'HSLA', HSV: 'HSVA' }
export function initColorFormat(format: ColorFormat, enableAlpha: boolean): ColorFormat {
  return enableAlpha ? alphaFormats[format] ?? format : format
}
export function getColorFormatOptions(enableAlpha: boolean) {
  return formats.map(format => initColorFormat(format, enableAlpha))
}

function hexByte(number: number) {
  return Math.round(number).toString(16).padStart(2, '0')
}

export function isValidColor(value: string) {
  return Boolean(parseSolid(value) || parseGradient(value))
}

export class Color {
  private channels: Hsva = { h: 0, s: 0, v: 0, a: 1 }
  private points: GradientColorPoint[] = []
  private nextPoint = 0
  private selected = ''
  private degree = 90
  isGradient = false

  constructor(input: string) {
    this.update(input)
  }

  update(input: string) {
    const gradient = parseGradient(input)
    if (gradient) {
      this.isGradient = true
      this.degree = gradient.degree
      this.points = gradient.points.map((point, i) => ({
        ...point, id: this.points[i]?.id ?? `point-${++this.nextPoint}`,
      }))
      this.gradientSelectedId = this.gradientSelectedPoint?.id ?? this.points[0].id
      return
    }
    const solid = parseSolid(input)
    if (solid) {
      this.channels = solid
      this.updateStop()
    }
  }

  private updateStop() {
    if (this.isGradient && this.gradientSelectedPoint) {
      this.points = this.points.map(point => point.id === this.selected ? { ...point, color: this.rgba } : point)
    }
  }
  private setChannel(key: keyof Hsva, value: number) {
    if (!Number.isFinite(value)) return
    this.channels[key] = clamp(value, key === 'h' ? 360 : 1)
    this.updateStop()
  }
  get hue() { return this.channels.h }
  set hue(value: number) { this.setChannel('h', value) }
  get saturation() { return this.channels.s }
  set saturation(value: number) { this.setChannel('s', value) }
  get value() { return this.channels.v }
  set value(value: number) { this.setChannel('v', value) }
  get alpha() { return this.channels.a }
  set alpha(value: number) { this.setChannel('a', Math.round(value * 100) / 100) }

  getRgba() { return hsvToRgb(this.channels) }
  getHsla() { return hsvToHsl(this.channels) }
  getHsva() {
    return { h: Math.round(this.hue), s: Math.round(this.saturation * 100), v: Math.round(this.value * 100), a: this.alpha }
  }
  getCmyk() { return rgbToCmyk(this.getRgba()) }
  get rgb() {
    const { r, g, b } = this.getRgba()
    return `rgb(${r}, ${g}, ${b})`
  }
  get rgba() {
    const { r, g, b, a } = this.getRgba()
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  get hex() {
    const { r, g, b } = this.getRgba()
    return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}`
  }
  get hex8() { return this.hex + hexByte(this.alpha * 255) }
  get hsl() {
    const { h, s, l } = this.getHsla()
    return `hsl(${h}, ${s}%, ${l}%)`
  }
  get hsla() {
    const { h, s, l, a } = this.getHsla()
    return `hsla(${h}, ${s}%, ${l}%, ${a})`
  }
  get hsv() {
    const { h, s, v } = this.getHsva()
    return `hsv(${h}, ${s}%, ${v}%)`
  }
  get hsva() {
    const { h, s, v, a } = this.getHsva()
    return `hsva(${h}, ${s}%, ${v}%, ${a})`
  }
  get cmyk() {
    const { c, m, y, k } = this.getCmyk()
    return `cmyk(${c}, ${m}, ${y}, ${k})`
  }
  get css() { return this.isGradient ? this.linearGradient : this.rgba }
  get gradientDegree() { return this.degree }
  set gradientDegree(value: number) { if (Number.isFinite(value)) this.degree = clamp(value, 360) }
  get gradientColors() { return this.points }
  set gradientColors(points: GradientColorPoint[]) {
    if (points.length < 2) return
    this.points = points
    if (!this.gradientSelectedPoint) this.gradientSelectedId = points[0].id
  }
  get gradientSelectedId() { return this.selected }
  set gradientSelectedId(id: string) {
    const point = this.points.find(item => item.id === id)
    if (!point) return
    this.selected = id
    const channels = parseSolid(point.color)
    if (channels) this.channels = channels
  }
  get gradientSelectedPoint() { return this.points.find(point => point.id === this.selected) }
  get linearGradient() { return gradientColors2string({ points: this.points, degree: this.degree }) }

  getFormattedColor(format: ColorFormat, enableAlpha: boolean) {
    if (this.isGradient) return this.linearGradient
    const key = initColorFormat(format, enableAlpha).toLowerCase() as Lowercase<ColorFormat>
    return this[key]
  }
  static isGradientColor(input: string) { return Boolean(parseGradient(input)) }
  static isValid = isValidColor
  static compare(first: string, second: string) {
    const solid = parseSolid(first)
    if (solid) {
      const other = parseSolid(second)
      if (!other) return false
      const a = hsvToRgb(solid), b = hsvToRgb(other)
      return a.r === b.r && a.g === b.g && a.b === b.b && hexByte(a.a * 255) === hexByte(b.a * 255)
    }
    const gradient = parseGradient(first), other = parseGradient(second)
    return Boolean(gradient && other && gradientColors2string(gradient) === gradientColors2string(other))
  }
  static object2color(values: Record<string, number | string>, format: ColorFormat) {
    const { r, g, b, h, s, l, v, a = 1, c, m, y, k } = values
    switch (format) {
      case 'RGB': case 'RGBA': return `rgba(${r}, ${g}, ${b}, ${a})`
      case 'HSL': case 'HSLA': return `hsla(${h}, ${s}%, ${l}%, ${a})`
      case 'HSV': case 'HSVA': return `hsva(${h}, ${s}%, ${v}%, ${a})`
      case 'CMYK': return `cmyk(${c}, ${m}, ${y}, ${k})`
      case 'CSS': return String(values.css)
      default: return String(values.hex)
    }
  }
}

export function getColorObject(color: Color): ColorObject {
  const { alpha, css, hex, hex8, hsl, hsla, hsv, hsva, rgb, rgba, saturation, value, isGradient } = color
  return { alpha, css, hex, hex8, hsl, hsla, hsv, hsva, rgb, rgba, saturation, value, isGradient,
    ...(isGradient ? { linearGradient: color.linearGradient } : {}) }
}

interface ChannelInput {
  key: string
  type: 'input' | 'inputNumber'
  min?: number
  max?: number
}
export function getColorFormatInputs(format: ColorFormat, enableAlpha: boolean): ChannelInput[] {
  const numeric = (key: string, max: number): ChannelInput => ({ key, type: 'inputNumber', min: 0, max })
  let inputs: ChannelInput[]
  switch (format) {
    case 'HEX': case 'HEX8': inputs = [{ key: 'hex', type: 'input' }]; break
    case 'CSS': inputs = [{ key: 'css', type: 'input' }]; break
    case 'RGB': case 'RGBA': inputs = ['r', 'g', 'b'].map(key => numeric(key, 255)); break
    case 'HSL': case 'HSLA': inputs = [numeric('h', 360), numeric('s', 100), numeric('l', 100)]; break
    case 'HSV': case 'HSVA': inputs = [numeric('h', 360), numeric('s', 100), numeric('v', 100)]; break
    case 'CMYK': inputs = ['c', 'm', 'y', 'k'].map(key => numeric(key, 100)); break
  }
  if (enableAlpha && format !== 'CMYK') inputs.push(numeric('a', 100))
  return inputs
}

type Encoded = Record<ColorFormat, Record<string, number | string>>
export function getColorFormatMap(color: Color, direction: 'encode'): Encoded
export function getColorFormatMap(color: Color, direction: 'decode'): Record<ColorFormat, string>
export function getColorFormatMap(color: Color, direction: 'encode' | 'decode'): Encoded | Record<ColorFormat, string> {
  if (direction === 'decode') {
    return { RGB: color.rgb, RGBA: color.rgba, HEX: color.hex, HEX8: color.hex8, HSL: color.hsl,
      HSLA: color.hsla, HSV: color.hsv, HSVA: color.hsva, CMYK: color.cmyk, CSS: color.css }
  }
  const rgb = color.getRgba(), hsl = color.getHsla(), hsv = color.getHsva()
  return { RGB: rgb, RGBA: rgb, HSL: hsl, HSLA: hsl, HSV: hsv, HSVA: hsv, CMYK: color.getCmyk(),
    HEX: { hex: color.hex }, HEX8: { hex: color.hex8 }, CSS: { css: color.css } }
}
