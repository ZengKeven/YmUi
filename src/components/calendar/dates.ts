// 按本地年月日运算，避免 UTC 解析、夏令时和 Date 构造器对两位年份的特殊处理。
export function localDate(year: number, month: number, day: number) {
  const date = new Date(0)
  date.setFullYear(year, month, day)
  date.setHours(0, 0, 0, 0)
  return date
}

export function dateKey(date: Date) {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return
  const [year, month, day] = value.split('-').map(Number)
  const date = localDate(year, month - 1, day)
  if (year > 0 && dateKey(date) === value) return date
}

export function addDays(date: Date, amount: number) {
  return localDate(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

export function inMonth(date: Date, year: number, month: number) {
  const lastDay = localDate(year, month + 1, 0).getDate()
  return localDate(year, month, Math.min(date.getDate(), lastDay))
}

const lunarDays = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
]
let lunarFormatter: Intl.DateTimeFormat | undefined

export function lunarLabel(date: Date) {
  lunarFormatter ??= new Intl.DateTimeFormat('zh-CN', {
    calendar: 'chinese', numberingSystem: 'latn', month: 'long', day: 'numeric',
  })
  const parts = lunarFormatter.formatToParts(date)
  const day = parts.find(part => part.type === 'day')?.value
  if (day === '1' || day === '初一') return parts.find(part => part.type === 'month')?.value
  return lunarDays[Number(day) - 1] ?? day
}
