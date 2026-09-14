/** Expand tokens such as `7-9,11-18` into a sorted unique list of week numbers. */
export function parseWeeks(token: string): number[] {
  const cleaned = token.replace(/\s+/g, "").replace(/周/g, "")
  const weeks = new Set<number>()

  for (const part of cleaned.split(",").filter(Boolean)) {
    const bounds = part.split("-")
    if (bounds.length === 1) {
      const week = Number(bounds[0])
      if (Number.isInteger(week) && week > 0) {
        weeks.add(week)
      }
      continue
    }

    if (bounds.length === 2) {
      const start = Number(bounds[0])
      const end = Number(bounds[1])
      if (
        Number.isInteger(start) &&
        Number.isInteger(end) &&
        start > 0 &&
        end >= start
      ) {
        for (let week = start; week <= end; week += 1) {
          weeks.add(week)
        }
      }
    }
  }

  return [...weeks].sort((left, right) => left - right)
}

const WEEK_TOKEN_RE =
  /((?:\d+(?:\s*-\s*\d+)?)(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*)\s*周/g

export function parseWeeksFromText(text: string): number[] {
  const weeks = new Set<number>()
  for (const match of text.matchAll(WEEK_TOKEN_RE)) {
    for (const week of parseWeeks(match[1])) {
      weeks.add(week)
    }
  }
  return [...weeks].sort((left, right) => left - right)
}
