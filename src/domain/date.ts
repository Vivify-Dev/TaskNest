const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const pad = (value: number) => value.toString().padStart(2, '0')

const fallbackParts = () => {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  }
}

export const isDateStr = (value: string) => DATE_RE.test(value)

export const todayStr = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const parseDateParts = (dateStr: string) => {
  if (!isDateStr(dateStr)) {
    return fallbackParts()
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return fallbackParts()
  }

  return { year, month, day }
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const parseDate = (dateStr: string) => {
  const { year, month, day } = parseDateParts(dateStr)
  return new Date(year, month - 1, day)
}

export const formatDate = (dateStr: string) => {
  return dateFormatter.format(parseDate(dateStr))
}

export const compareDateStr = (a: string, b: string) => {
  if (a === b) return 0
  return a < b ? -1 : 1
}

export const addDays = (dateStr: string, days: number) => {
  const date = parseDate(dateStr)
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
