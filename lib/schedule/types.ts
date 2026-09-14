export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DayPart = "morning" | "afternoon" | "evening"

export type ScheduleMetadata = {
  university: string | null
  studentName: string | null
  academicTerm: string | null
  className: string | null
  major: string | null
  department: string | null
  printedAt: string | null
}

export type PeriodSlot = {
  id: string
  sectionNumber: number
  startTime: string
  endTime: string
  dayPart: DayPart
}

export type Meeting = {
  title: string
  instructors: string[]
  weeks: number[]
  location: string | null
  dayIndex: DayIndex
  sectionNumbers: number[]
}

export type Schedule = {
  version: 1
  importedAt: string
  metadata: ScheduleMetadata
  periods: PeriodSlot[]
  meetings: Meeting[]
  notes: string[]
}

export type CellOffering = {
  title: string
  instructors: string[]
  weeks: number[]
  location: string | null
}

export type CourseTint =
  | "default"
  | "pe"
  | "language"
  | "politics"
  | "psychology"
  | "math"
  | "programming"
