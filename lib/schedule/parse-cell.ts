import type { CellOffering } from "@/lib/schedule/types"
import { parseWeeks } from "@/lib/schedule/parse-weeks"

/**
 * Course titles in the official export do not contain spaces. Location text
 * sits between `weeks;` and the next title, so the last token before `[` is
 * the next course title and the rest is the current location.
 */
const OFFERING_MARKER_RE =
  /\[([^\]]+)\]\s*((?:\d+(?:\s*-\s*\d+)?)(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*)\s*周\s*[;；]/g

export function parseCell(raw: string): CellOffering[] {
  const text = raw.replace(/\s+/g, " ").trim()
  if (!text) {
    return []
  }

  const markers: Array<{
    instructors: string
    weeks: string
    index: number
    end: number
  }> = []

  for (const match of text.matchAll(OFFERING_MARKER_RE)) {
    markers.push({
      instructors: match[1],
      weeks: match[2],
      index: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    })
  }

  const offerings: CellOffering[] = []
  let searchFrom = 0

  for (let index = 0; index < markers.length; index += 1) {
    const current = markers[index]
    const before = text.slice(searchFrom, current.index).trim()
    const title = before.split(/\s+/).filter(Boolean).at(-1)
    if (!title) {
      continue
    }

    const nextIndex = markers[index + 1]?.index ?? text.length
    const afterParts = text
      .slice(current.end, nextIndex)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    const locationParts = markers[index + 1]
      ? afterParts.slice(0, -1)
      : afterParts
    const location = locationParts.join(" ") || null

    offerings.push({
      title,
      instructors: current.instructors
        .split(/[,，]/)
        .map((name) => name.trim())
        .filter(Boolean),
      weeks: parseWeeks(current.weeks),
      location,
    })

    searchFrom = current.end
  }

  return offerings
}

export function isRemarkCell(raw: string): boolean {
  return /^备注[:：]/.test(raw.trim())
}

export function parseRemarkText(raw: string): string {
  return raw
    .trim()
    .replace(/^备注[:：]\s*/, "")
    .replace(/[;；]+\s*$/, "")
    .trim()
}
