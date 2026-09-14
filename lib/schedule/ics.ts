import {
  CALENDAR_PRODID,
  SHANGHAI_OFFSET_HOURS,
  TIME_ZONE,
  WEEK1_MONDAY,
} from "@/lib/schedule/calendar-config"
import { CANONICAL_PERIODS } from "@/lib/schedule/periods"
import type { Meeting, Schedule } from "@/lib/schedule/types"

const WEEK1_PARTS = WEEK1_MONDAY.split("-").map(Number)
const WEEK1_YEAR = WEEK1_PARTS[0] ?? 2026
const WEEK1_MONTH = WEEK1_PARTS[1] ?? 8
const WEEK1_DAY = WEEK1_PARTS[2] ?? 31

type CivilDate = {
  year: number
  month: number
  day: number
}

function addDays(date: CivilDate, days: number): CivilDate {
  const utc = Date.UTC(date.year, date.month - 1, date.day) + days * 86_400_000
  const next = new Date(utc)
  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  }
}

function dateForMeeting(week: number, dayIndex: number): CivilDate {
  return addDays(
    { year: WEEK1_YEAR, month: WEEK1_MONTH, day: WEEK1_DAY },
    (week - 1) * 7 + dayIndex
  )
}

function parseClock(value: string): { hour: number; minute: number } | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    return null
  }
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null
  }
  return { hour, minute }
}

function formatUtcStamp(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hour = String(date.getUTCHours()).padStart(2, "0")
  const minute = String(date.getUTCMinutes()).padStart(2, "0")
  const second = String(date.getUTCSeconds()).padStart(2, "0")
  return `${year}${month}${day}T${hour}${minute}${second}Z`
}

function shanghaiClockToUtc(
  date: CivilDate,
  clock: { hour: number; minute: number }
): Date {
  return new Date(
    Date.UTC(
      date.year,
      date.month - 1,
      date.day,
      clock.hour - SHANGHAI_OFFSET_HOURS,
      clock.minute,
      0
    )
  )
}

function escapeText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\r\n", "\\n")
    .replaceAll("\n", "\\n")
}

function foldLine(line: string): string[] {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const bytes = encoder.encode(line)
  if (bytes.length <= 75) {
    return [line]
  }

  const lines: string[] = []
  let offset = 0
  let first = true
  while (offset < bytes.length) {
    const limit = first ? 75 : 74
    let end = Math.min(offset + limit, bytes.length)
    while (end > offset && (bytes[end] & 0b1100_0000) === 0b1000_0000) {
      end -= 1
    }
    if (end === offset) {
      end = Math.min(offset + limit, bytes.length)
    }
    const chunk = decoder.decode(bytes.slice(offset, end))
    lines.push(first ? chunk : ` ${chunk}`)
    first = false
    offset = end
  }
  return lines
}

function fnv1aHex(value: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

function periodBySection(sectionNumber: number) {
  return CANONICAL_PERIODS.find(
    (period) => period.sectionNumber === sectionNumber
  )
}

function meetingClockRange(meeting: Meeting): {
  start: { hour: number; minute: number }
  end: { hour: number; minute: number }
} | null {
  const sections = meeting.sectionNumbers.filter(
    (section) => Number.isInteger(section) && section >= 1
  )
  if (sections.length === 0) {
    return null
  }

  const startPeriod = periodBySection(Math.min(...sections))
  const endPeriod = periodBySection(Math.max(...sections))
  if (!startPeriod || !endPeriod) {
    return null
  }

  const start = parseClock(startPeriod.startTime)
  const end = parseClock(endPeriod.endTime)
  if (!start || !end) {
    return null
  }

  return { start, end }
}

function calendarName(schedule: Schedule): string {
  const term = schedule.metadata.academicTerm
  const student = schedule.metadata.studentName
  if (term && student) {
    return `${student} ${term}`
  }
  if (term) {
    return term
  }
  if (student) {
    return `${student} 课程表`
  }
  return "NEFU 课程表"
}

function eventUid(meeting: Meeting, week: number): string {
  const key = [
    meeting.title,
    meeting.instructors.join(","),
    meeting.location ?? "",
    String(meeting.dayIndex),
    meeting.sectionNumbers.join("-"),
    String(week),
  ].join("|")
  return `nefu-${fnv1aHex(key)}@schedule`
}

export function scheduleToIcs(schedule: Schedule): string {
  const dtstamp = formatUtcStamp(new Date(schedule.importedAt))
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${CALENDAR_PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName(schedule))}`,
    `X-WR-TIMEZONE:${TIME_ZONE}`,
  ]

  for (const meeting of schedule.meetings) {
    const clocks = meetingClockRange(meeting)
    if (!clocks) {
      continue
    }

    for (const week of meeting.weeks) {
      if (!Number.isInteger(week) || week < 1) {
        continue
      }

      const date = dateForMeeting(week, meeting.dayIndex)
      const start = shanghaiClockToUtc(date, clocks.start)
      const end = shanghaiClockToUtc(date, clocks.end)
      const description = meeting.instructors.join("、")

      lines.push("BEGIN:VEVENT")
      lines.push(`UID:${eventUid(meeting, week)}`)
      lines.push(`DTSTAMP:${dtstamp}`)
      lines.push(`DTSTART:${formatUtcStamp(start)}`)
      lines.push(`DTEND:${formatUtcStamp(end)}`)
      lines.push(`SUMMARY:${escapeText(meeting.title)}`)
      if (meeting.location) {
        lines.push(`LOCATION:${escapeText(meeting.location)}`)
      }
      if (description) {
        lines.push(`DESCRIPTION:${escapeText(description)}`)
      }
      lines.push("END:VEVENT")
    }
  }

  lines.push("END:VCALENDAR")

  return lines.flatMap(foldLine).join("\r\n") + "\r\n"
}
