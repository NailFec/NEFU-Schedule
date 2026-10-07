import type { Locale } from "@/lib/i18n/messages"
import { WEEK1_MONDAY } from "@/lib/schedule/calendar-config"

export type CivilDate = {
  year: number
  month: number
  day: number
}

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

function parseIsoDate(value: string): CivilDate {
  const [year, month, day] = value.split("-").map(Number)
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    throw new Error(`Invalid date: ${value}`)
  }
  return { year, month, day }
}

const WEEK1 = parseIsoDate(WEEK1_MONDAY)

export function addDays(date: CivilDate, days: number): CivilDate {
  const utc = Date.UTC(date.year, date.month - 1, date.day) + days * 86_400_000
  const next = new Date(utc)
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  }
}

/** Calendar date for a teaching week. Week 1 contains September 1; day 0 is Monday. */
export function dateForWeekDay(week: number, dayIndex: number): CivilDate {
  return addDays(WEEK1, (week - 1) * 7 + dayIndex)
}

export function formatMonthDay(date: CivilDate, locale: Locale): string {
  if (locale === "zh") {
    return `${date.month}月${date.day}日`
  }
  return `${EN_MONTHS[date.month - 1]} ${date.day}`
}

/** Monday–Sunday span for a teaching week. */
export function formatWeekDateRange(week: number, locale: Locale): string {
  const start = dateForWeekDay(week, 0)
  const end = dateForWeekDay(week, 6)
  if (locale === "en" && start.month === end.month) {
    return `${EN_MONTHS[start.month - 1]} ${start.day}–${end.day}`
  }
  return `${formatMonthDay(start, locale)}–${formatMonthDay(end, locale)}`
}

export function formatDayDate(date: CivilDate): string {
  return `${date.month}/${date.day}`
}
