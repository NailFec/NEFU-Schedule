import type { WorkSheet } from "xlsx"

import {
  isRemarkCell,
  parseCell,
  parseRemarkText,
} from "@/lib/schedule/parse-cell"
import { parseWeeksFromText } from "@/lib/schedule/parse-weeks"
import { CANONICAL_PERIODS } from "@/lib/schedule/periods"
import type {
  DayIndex,
  Meeting,
  Schedule,
  ScheduleMetadata,
} from "@/lib/schedule/types"

const DAY_HEADERS: Array<{ label: string; dayIndex: DayIndex }> = [
  { label: "星期一", dayIndex: 0 },
  { label: "星期二", dayIndex: 1 },
  { label: "星期三", dayIndex: 2 },
  { label: "星期四", dayIndex: 3 },
  { label: "星期五", dayIndex: 4 },
  { label: "星期六", dayIndex: 5 },
  { label: "星期日", dayIndex: 6 },
]

function cellString(value: unknown): string {
  if (value == null) {
    return ""
  }
  return String(value).trim()
}

function readSheetGrid(
  sheet: WorkSheet,
  encodeCell: (address: { r: number; c: number }) => string,
  decodeRange: (ref: string) => {
    s: { r: number; c: number }
    e: { r: number; c: number }
  }
): string[][] {
  const ref = sheet["!ref"]
  if (!ref) {
    return []
  }

  const range = decodeRange(ref)
  const rows: string[][] = []

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    const cells: string[] = []
    for (let column = range.s.c; column <= range.e.c; column += 1) {
      const cell = sheet[encodeCell({ r: row, c: column })] as
        { w?: string; v?: unknown } | undefined
      cells.push(cellString(cell?.w ?? cell?.v))
    }
    rows.push(cells)
  }

  for (const merge of sheet["!merges"] ?? []) {
    for (let row = merge.s.r; row <= merge.e.r; row += 1) {
      for (let column = merge.s.c; column <= merge.e.c; column += 1) {
        if (row === merge.s.r && column === merge.s.c) {
          continue
        }
        const localRow = row - range.s.r
        const localColumn = column - range.s.c
        if (rows[localRow]) {
          rows[localRow][localColumn] = ""
        }
      }
    }
  }

  return rows
}

function extractLabeledValue(text: string, label: string): string | null {
  const match = text.match(
    new RegExp(
      `${label}[:：]\\s*(.*?)(?=(?:\\s{2,}|学年学期|班级|专业|院系|打印日期|$))`
    )
  )
  const value = match?.[1]?.trim()
  return value ? value : null
}

function parseTitleRow(
  text: string
): Pick<ScheduleMetadata, "university" | "studentName"> {
  const match = text.match(/^(.*?)\s+(\S+)\s+学生个人课表/)
  if (!match) {
    return { university: null, studentName: null }
  }
  return {
    university: match[1].trim() || null,
    studentName: match[2].trim() || null,
  }
}

function parseMetadata(rows: string[][]): ScheduleMetadata {
  const blob = rows.slice(0, 4).flat().filter(Boolean).join("  ")

  const title = parseTitleRow(blob)

  return {
    university: title.university,
    studentName: title.studentName,
    academicTerm: extractLabeledValue(blob, "学年学期"),
    className: extractLabeledValue(blob, "班级"),
    major: extractLabeledValue(blob, "专业"),
    department: extractLabeledValue(blob, "院系"),
    printedAt: extractLabeledValue(blob, "打印日期"),
  }
}

function findHeaderRow(rows: string[][]): {
  rowIndex: number
  dayColumns: Partial<Record<DayIndex, number>>
} | null {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    const dayColumns: Partial<Record<DayIndex, number>> = {}
    for (const [column, cell] of row.entries()) {
      const header = DAY_HEADERS.find((item) => cell.includes(item.label))
      if (header) {
        dayColumns[header.dayIndex] = column
      }
    }
    if (Object.keys(dayColumns).length >= 5) {
      return { rowIndex, dayColumns }
    }
  }
  return null
}

function parsePeriodSections(text: string): number[] | null {
  const compact = text.replace(/\s+/g, " ").trim()
  if (!compact) {
    return null
  }

  const sectionMatch = compact.match(/([\d、,\s]+)小节/)
  if (sectionMatch) {
    const sectionNumbers = sectionMatch[1]
      .split(/[、,，\s]+/)
      .map((part) => Number.parseInt(part, 10))
      .filter((value) => Number.isInteger(value) && value > 0)
    if (sectionNumbers.length > 0) {
      return sectionNumbers
    }
  }

  if (/第.+节/.test(compact)) {
    return []
  }

  return null
}

export function parseWorkbookSheet(
  sheet: WorkSheet,
  helpers: {
    encodeCell: (address: { r: number; c: number }) => string
    decodeRange: (ref: string) => {
      s: { r: number; c: number }
      e: { r: number; c: number }
    }
  }
): Schedule {
  const rows = readSheetGrid(sheet, helpers.encodeCell, helpers.decodeRange)
  const header = findHeaderRow(rows)
  if (!header) {
    throw new Error("Unrecognized schedule layout.")
  }

  const metadata = parseMetadata(rows)
  const meetings: Meeting[] = []
  const notes: string[] = []
  let foundPeriodRow = false

  for (
    let rowIndex = header.rowIndex + 1;
    rowIndex < rows.length;
    rowIndex += 1
  ) {
    const row = rows[rowIndex]
    const sectionNumbers = parsePeriodSections(row[0] ?? "")
    if (sectionNumbers == null) {
      for (const cell of row) {
        if (isRemarkCell(cell)) {
          const note = parseRemarkText(cell)
          if (note) {
            notes.push(note)
          }
        }
      }
      continue
    }

    foundPeriodRow = true
    if (sectionNumbers.length === 0) {
      continue
    }

    for (const [dayIndexKey, column] of Object.entries(header.dayColumns)) {
      if (column == null) {
        continue
      }
      const dayIndex = Number(dayIndexKey) as DayIndex
      const cell = row[column] ?? ""
      if (!cell) {
        continue
      }
      if (isRemarkCell(cell)) {
        const note = parseRemarkText(cell)
        if (note) {
          notes.push(note)
        }
        continue
      }

      for (const offering of parseCell(cell)) {
        meetings.push({
          ...offering,
          dayIndex,
          sectionNumbers,
        })
      }
    }
  }

  if (!foundPeriodRow) {
    throw new Error("No period rows found.")
  }

  return {
    version: 1,
    importedAt: new Date().toISOString(),
    metadata,
    periods: CANONICAL_PERIODS,
    meetings,
    notes,
  }
}

export async function parseWorkbookBuffer(
  data: ArrayBuffer | Uint8Array,
  importedAt = new Date().toISOString()
): Promise<Schedule> {
  const XLSX = await import("xlsx")
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  const workbook = XLSX.read(bytes, { type: "array" })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) {
    throw new Error("The workbook is empty.")
  }
  const sheet = workbook.Sheets[firstSheetName]
  if (!sheet) {
    throw new Error("The workbook is empty.")
  }

  const schedule = parseWorkbookSheet(sheet, {
    encodeCell: XLSX.utils.encode_cell,
    decodeRange: XLSX.utils.decode_range,
  })

  return {
    ...schedule,
    importedAt,
  }
}

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
