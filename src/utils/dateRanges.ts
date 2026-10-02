import dayjs from 'dayjs'

const FORMAT = 'YYYY-MM-DD'

export interface DateRange {
  begin: string
  end: string
}

function range(start: dayjs.Dayjs, end: dayjs.Dayjs): DateRange {
  return { begin: start.format(FORMAT), end: end.format(FORMAT) }
}

export function yesterdayRange(): DateRange {
  const yesterday = dayjs().subtract(1, 'day')
  return range(yesterday, yesterday)
}

export function last7DaysRange(): DateRange {
  return range(dayjs().subtract(6, 'day'), dayjs())
}

export function last30DaysRange(): DateRange {
  return range(dayjs().subtract(29, 'day'), dayjs())
}

export function thisWeekRange(): DateRange {
  return range(dayjs().startOf('week').add(1, 'day'), dayjs())
}

export function thisMonthRange(): DateRange {
  return range(dayjs().startOf('month'), dayjs())
}
