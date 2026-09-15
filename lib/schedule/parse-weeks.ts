/** Expand tokens such as `7-9,11-18` or `01、02` into a sorted unique list. */
export function expandNumberList(token: string): number[] {
  const cleaned = token.replace(/\s+/g, "")
  const values = new Set<number>()

  for (const part of cleaned.split(/[,，、]/).filter(Boolean)) {
    const bounds = part.split(/[-–—]/)
    if (bounds.length === 1) {
      const value = Number.parseInt(bounds[0] ?? "", 10)
      if (Number.isInteger(value) && value > 0) {
        values.add(value)
      }
      continue
    }

    if (bounds.length === 2) {
      const start = Number.parseInt(bounds[0] ?? "", 10)
      const end = Number.parseInt(bounds[1] ?? "", 10)
      if (
        Number.isInteger(start) &&
        Number.isInteger(end) &&
        start > 0 &&
        end >= start
      ) {
        for (let value = start; value <= end; value += 1) {
          values.add(value)
        }
      }
    }
  }

  return [...values].sort((left, right) => left - right)
}

/** Expand tokens such as `7-9,11-18` into a sorted unique list of week numbers. */
export function parseWeeks(token: string): number[] {
  const compact = token.replace(/\s+/g, "")
  const oddOnly = /单周|\(单\)|（单）/.test(compact)
  const evenOnly = /双周|\(双\)|（双）/.test(compact)
  const weeks = expandNumberList(
    compact
      .replace(/\[.*?\]/g, "")
      .replace(/[（(](?:单|双)周?[）)]/g, "")
      .replace(/[单双]周/g, "")
      .replace(/周/g, "")
  )

  if (oddOnly) {
    return weeks.filter((week) => week % 2 === 1)
  }
  if (evenOnly) {
    return weeks.filter((week) => week % 2 === 0)
  }
  return weeks
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
