import type { Locale } from "@/lib/i18n/messages"
import type { ScheduleSource } from "@/lib/schedule/calendar-config"

const LOCALE_KEY = "nefu-schedule:locale"
const WEEK_KEY = "nefu-schedule:week"
const SOURCE_KEY = "nefu-schedule:source"

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

export function loadScheduleSource(): ScheduleSource {
  if (typeof window === "undefined") {
    return "default"
  }

  try {
    const raw = window.localStorage.getItem(SOURCE_KEY)
    if (raw === "rigel") {
      return "rigel"
    }
  } catch {
    return "default"
  }

  return "default"
}

export function saveScheduleSource(source: ScheduleSource): void {
  window.localStorage.setItem(SOURCE_KEY, source)
}

export function htmlLangForLocale(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en"
}
