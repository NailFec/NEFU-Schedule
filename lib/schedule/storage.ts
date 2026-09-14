import type { Locale } from "@/lib/i18n/messages"
import { normalizeSchedule } from "@/lib/schedule/normalize"
import type { Schedule } from "@/lib/schedule/types"

const SCHEDULE_KEY = "nefu-schedule:v1"
const LOCALE_KEY = "nefu-schedule:locale"
const WEEK_KEY = "nefu-schedule:week"

export function loadSchedule(): Schedule | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(SCHEDULE_KEY)
    if (!raw) {
      return null
    }
    return normalizeSchedule(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveSchedule(schedule: Schedule): void {
  window.localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule))
}

export function loadLocale(): Locale {
  if (typeof window === "undefined") {
    return "zh"
  }

  try {
    const raw = window.localStorage.getItem(LOCALE_KEY)
    if (raw === "en" || raw === "zh") {
      return raw
    }
  } catch {
    return "zh"
  }

  return "zh"
}

export function saveLocale(locale: Locale): void {
  window.localStorage.setItem(LOCALE_KEY, locale)
}

export function loadSelectedWeek(): number | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(WEEK_KEY)
    if (!raw) {
      return null
    }
    const week = Number(raw)
    return Number.isInteger(week) && week > 0 ? week : null
  } catch {
    return null
  }
}

export function saveSelectedWeek(week: number): void {
  window.localStorage.setItem(WEEK_KEY, String(week))
}

export function htmlLangForLocale(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en"
}
