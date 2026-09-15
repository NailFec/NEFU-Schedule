import { parse, type HTMLElement } from "node-html-parser"

import { expandNumberList, parseWeeks } from "@/lib/schedule/parse-weeks"
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

const INSTRUCTOR_SUFFIXES = [
  "高等学校教师",
  "高级教师（中学）",
  "讲师（高校）",
  "副教授",
  "教授",
  "讲师",
  "其它",
] as const

const DETAIL_RE =
  /老师[:：]\s*(.*?)\s*[;；]\s*时间[:：]\s*(.*?)\s*[;；]\s*地点[:：]\s*(.*)$/

function collapseText(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function childElements(node: HTMLElement, tagName: string): HTMLElement[] {
  return node.childNodes.filter((child): child is HTMLElement => {
    return (
      child.nodeType === 1 &&
      "tagName" in child &&
      child.tagName === tagName.toUpperCase()
    )
  })
}

function parseSectionNumbers(text: string): number[] {
  const compact = collapseText(text)
  const subsection = compact.match(/([\d、,，\-\s]+)小节/)
  if (subsection?.[1]) {
    return expandNumberList(subsection[1])
  }

  const bracket = compact.match(/\[([^\]]+)节\]/)
  if (bracket?.[1]) {
    return expandNumberList(bracket[1])
  }

  return []
}

function stripInstructorTitle(raw: string): string {
  let name = raw.trim()
  for (const suffix of INSTRUCTOR_SUFFIXES) {
    if (name.endsWith(suffix)) {
      name = name.slice(0, -suffix.length).trim()
      break
    }
  }
  return name
}

function parseInstructors(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((name) => stripInstructorTitle(name))
    .filter(Boolean)
}

function parseTimeToken(raw: string): {
  weeks: number[]
  sectionNumbers: number[]
} {
  const compact = collapseText(raw)
  const match = compact.match(/^(.*?)周(.*)$/)
  const weekToken = match?.[1] ?? compact
  const afterWeek = match?.[2] ?? ""
  return {
    weeks: parseWeeks(`${weekToken}周${afterWeek}`),
    sectionNumbers: parseSectionNumbers(compact),
  }
}

function extractLabeledValue(text: string, label: string): string | null {
  const match = text.match(
    new RegExp(`${label}[:：]\\s*(.*?)(?=(?:[;；]|班级|总人数|考核方式|$))`)
  )
  const value = match?.[1]?.trim()
  return value ? value : null
}

function pickClassName(candidates: string[]): string | null {
  if (candidates.length === 0) {
    return null
  }

  const studentClass = candidates.find(
    (value) => /\d{2}班$/.test(value) && !value.includes("[")
  )
  return studentClass ?? candidates[0] ?? null
}

function parseMetadata(
  html: string,
  root: HTMLElement,
  classNames: string[]
): ScheduleMetadata {
  const selectedTerm =
    root.querySelector("#xnxq01id option[selected]") ??
    root.querySelector('#xnxq01id option[selected="selected"]')
  const academicTerm = collapseText(selectedTerm?.text ?? "") || null

  const savedFrom = html.match(
    /saved from url=\([^)]*\)(https?:\/\/[^\s"<>]+)/i
  )?.[1]
  const university = savedFrom?.includes("nefu.edu.cn") ? "东北林业大学" : null

  return {
    university,
    studentName: null,
    academicTerm,
    className: pickClassName(classNames),
    major: null,
    department: null,
    printedAt: null,
  }
}

function parseCourseItem(
  item: HTMLElement,
  dayIndex: DayIndex,
  rowSections: number[]
): { meeting: Meeting; className: string | null } | null {
  const title = collapseText(
    item.querySelector(".qz-hasCourse-title")?.text ?? ""
  )
  const detail = collapseText(
    item.querySelector(".qz-hasCourse-abbrinfo")?.text ?? ""
  )
  if (!title || !detail) {
    return null
  }

  const fields = detail.match(DETAIL_RE)
  if (!fields) {
    return null
  }

  const instructors = parseInstructors(fields[1] ?? "")
  const time = parseTimeToken(fields[2] ?? "")
  const location = collapseText(fields[3] ?? "") || null
  const sectionNumbers =
    time.sectionNumbers.length > 0 ? time.sectionNumbers : rowSections

  if (time.weeks.length === 0 || sectionNumbers.length === 0) {
    return null
  }

  const className = extractLabeledValue(
    collapseText(item.querySelector('[name="dealeSpan"]')?.text ?? ""),
    "班级"
  )

  return {
    meeting: {
      title,
      instructors,
      weeks: time.weeks,
      location,
      dayIndex,
      sectionNumbers,
    },
    className,
  }
}

function parseNotes(table: HTMLElement): string[] {
  const notes: string[] = []
  for (const row of table.querySelectorAll("tfoot tr")) {
    const label = collapseText(
      row.querySelector(".index-title")?.text ??
        row.querySelector("td")?.text ??
        ""
    )
    if (!label.includes("备注")) {
      continue
    }
    const detail = collapseText(
      row.querySelector(".qz-weeklyTable-detailtext")?.text ??
        childElements(row, "td")[1]?.text ??
        ""
    )
    if (detail) {
      notes.push(detail.replace(/[;；]+\s*$/, "").trim())
    }
  }
  return notes
}

export function parseScheduleHtml(
  html: string,
  importedAt = new Date().toISOString()
): Schedule {
  const root = parse(html)
  const table = root.querySelector("table.qz-weeklyTable")
  if (!table) {
    throw new Error("Unrecognized schedule layout.")
  }

  const headerCells = table.querySelectorAll("thead th")
  const dayColumns: DayIndex[] = []
  for (const cell of headerCells) {
    const label = collapseText(cell.text)
    const header = DAY_HEADERS.find((item) => label.includes(item.label))
    if (header) {
      dayColumns.push(header.dayIndex)
    }
  }
  if (dayColumns.length < 5) {
    throw new Error("Unrecognized schedule layout.")
  }

  const meetings: Meeting[] = []
  const classNames: string[] = []
  const pendingRowspan = new Map<DayIndex, number>()
  const bodyRows = table.querySelectorAll("tbody tr")
  let foundPeriodRow = false

  for (const row of bodyRows) {
    const cells = childElements(row, "td")
    if (cells.length === 0) {
      continue
    }

    const labelCell = cells[0]
    const rowSections = parseSectionNumbers(labelCell?.text ?? "")
    if (rowSections.length === 0) {
      continue
    }

    foundPeriodRow = true
    const dataCells = cells.slice(1)
    let dataIndex = 0

    for (const dayIndex of dayColumns) {
      const remaining = pendingRowspan.get(dayIndex) ?? 0
      if (remaining > 0) {
        pendingRowspan.set(dayIndex, remaining - 1)
        continue
      }

      const cell = dataCells[dataIndex]
      dataIndex += 1
      if (!cell) {
        continue
      }

      const rowspan = Number.parseInt(cell.getAttribute("rowspan") ?? "1", 10)
      if (Number.isInteger(rowspan) && rowspan > 1) {
        pendingRowspan.set(dayIndex, rowspan - 1)
      }

      for (const item of cell.querySelectorAll("li.courselists-item")) {
        const parsed = parseCourseItem(item, dayIndex, rowSections)
        if (!parsed) {
          continue
        }
        meetings.push(parsed.meeting)
        if (parsed.className) {
          classNames.push(parsed.className)
        }
      }
    }
  }

  if (!foundPeriodRow) {
    throw new Error("No period rows found.")
  }

  return {
    version: 1,
    importedAt,
    metadata: parseMetadata(html, root, classNames),
    periods: CANONICAL_PERIODS,
    meetings,
    notes: parseNotes(table),
  }
}

export function htmlLooksLikeSchedule(html: string): boolean {
  return html.includes("qz-weeklyTable") || html.includes('id="kbtable"')
}
