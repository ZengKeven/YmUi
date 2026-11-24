interface CalendarHoliday {
  name: string
  workday: boolean
  firstDay: boolean
}

function indexHolidays() {
  const schedules = import.meta.glob<Record<string, string[]>>('./[0-9][0-9][0-9][0-9].ts', {
    eager: true, import: 'default',
  })
  const byDate = new Map<string, CalendarHoliday>()
  for (const schedule of Object.values(schedules)) {
    for (const [name, dates] of Object.entries(schedule)) {
      const workday = name === '补班'
      dates.forEach((date, index) => byDate.set(date, { name, workday, firstDay: !workday && index === 0 }))
    }
  }
  return byDate
}

let holidays: Map<string, CalendarHoliday> | undefined
export function holidayFor(date: string) {
  holidays ??= indexHolidays()
  return holidays.get(date)
}
