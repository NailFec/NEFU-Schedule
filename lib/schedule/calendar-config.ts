/** Monday of week 1: the week that contains 2026-09-01. */
export const WEEK1_MONDAY = "2026-08-31"

export const TIME_ZONE = "Asia/Shanghai"

export const SHANGHAI_OFFSET_HOURS = 8

export const FEED_PATH = "/feed.ics"

export const RIGEL_FEED_PATH = "/rigel-feed.ics"

export const SCHEDULE_SOURCES = ["default", "rigel"] as const

export type ScheduleSource = (typeof SCHEDULE_SOURCES)[number]

export function feedPathForSource(source: ScheduleSource): string {
  return source === "rigel" ? RIGEL_FEED_PATH : FEED_PATH
}

export const CALENDAR_PRODID = "-//NEFU-Schedule//EN"
