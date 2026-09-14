import { CANONICAL_PERIODS } from "@/lib/schedule/periods"
import type { DayIndex, Meeting, Schedule } from "@/lib/schedule/types"

type StoredPeriod = {
  id?: string
  sectionNumbers?: number[]
  sectionNumber?: number
}

type StoredMeeting = {
  title?: unknown
  instructors?: unknown
  weeks?: unknown
  location?: unknown
  dayIndex?: unknown
  periodId?: unknown
  sectionNumbers?: unknown
}

function asPositiveInts(values: unknown): number[] {
  if (!Array.isArray(values)) {
    return []
  }
  return [
    ...new Set(
      values
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0)
    ),
  ].sort((left, right) => left - right)
}

function sectionsFromPeriodId(
  periodId: unknown,
  periods: StoredPeriod[]
): number[] {
  if (typeof periodId !== "string" || !periodId) {
    return []
  }

  const matched = periods.find((period) => period.id === periodId)
  const fromSlot = asPositiveInts(matched?.sectionNumbers)
  if (fromSlot.length > 0) {
    return fromSlot
  }
  if (matched?.sectionNumber != null) {
    return asPositiveInts([matched.sectionNumber])
  }

  return asPositiveInts(periodId.split(/[-–—]/))
}

export function normalizeSchedule(raw: unknown): Schedule | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const data = raw as {
    version?: unknown
    importedAt?: unknown
    metadata?: Schedule["metadata"]
    periods?: StoredPeriod[]
    meetings?: StoredMeeting[]
    notes?: unknown
  }

  if (data.version !== 1 || !Array.isArray(data.meetings) || !data.metadata) {
    return null
  }

  const storedPeriods = Array.isArray(data.periods) ? data.periods : []
  const meetings: Meeting[] = []

  for (const meeting of data.meetings) {
    if (typeof meeting.title !== "string" || meeting.title.length === 0) {
      continue
    }
    const dayIndex = Number(meeting.dayIndex) as DayIndex
    if (dayIndex < 0 || dayIndex > 6) {
      continue
    }

    const sectionNumbers = asPositiveInts(meeting.sectionNumbers)
    const resolved =
      sectionNumbers.length > 0
        ? sectionNumbers
        : sectionsFromPeriodId(meeting.periodId, storedPeriods)
    if (resolved.length === 0) {
      continue
    }

    meetings.push({
      title: meeting.title,
      instructors: Array.isArray(meeting.instructors)
        ? meeting.instructors.filter(
            (name): name is string =>
              typeof name === "string" && name.length > 0
          )
        : [],
      weeks: asPositiveInts(meeting.weeks),
      location:
        typeof meeting.location === "string" && meeting.location.length > 0
          ? meeting.location
          : null,
      dayIndex,
      sectionNumbers: resolved,
    })
  }

  return {
    version: 1,
    importedAt:
      typeof data.importedAt === "string"
        ? data.importedAt
        : new Date().toISOString(),
    metadata: data.metadata,
    periods: CANONICAL_PERIODS,
    meetings,
    notes: Array.isArray(data.notes)
      ? data.notes.filter(
          (note): note is string => typeof note === "string" && note.length > 0
        )
      : [],
  }
}
