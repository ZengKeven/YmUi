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
