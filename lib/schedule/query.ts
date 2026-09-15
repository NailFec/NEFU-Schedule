import { parseWeeksFromText } from "@/lib/schedule/parse-weeks"
import type { Meeting, Schedule } from "@/lib/schedule/types"

export function getWeekRange(schedule: Schedule): {
  minWeek: number
  maxWeek: number
} {
  const weeks = new Set<number>()
  for (const meeting of schedule.meetings) {
    for (const week of meeting.weeks) {
      weeks.add(week)
    }
  }
  for (const note of schedule.notes) {
    for (const week of parseWeeksFromText(note)) {
      weeks.add(week)
    }
  }

  if (weeks.size === 0) {
    return { minWeek: 1, maxWeek: 1 }
  }

  return {
    minWeek: Math.min(...weeks),
    maxWeek: Math.max(...weeks),
  }
}

export function firstWeekWithMeetings(schedule: Schedule): number {
  const { minWeek, maxWeek } = getWeekRange(schedule)
  for (let week = minWeek; week <= maxWeek; week += 1) {
    if (schedule.meetings.some((meeting) => meeting.weeks.includes(week))) {
      return week
    }
  }
  return minWeek
}

export function meetingsForWeek(schedule: Schedule, week: number): Meeting[] {
  return schedule.meetings.filter((meeting) => meeting.weeks.includes(week))
}
