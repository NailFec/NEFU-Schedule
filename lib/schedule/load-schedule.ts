import { readFile, stat } from "node:fs/promises"
import path from "node:path"

import { parseWorkbookBuffer } from "@/lib/schedule/parse-workbook"
import type { Schedule } from "@/lib/schedule/types"

const CANDIDATE_NAMES = ["schedule.xls", "schedule.xlsx"] as const

type ScheduleCache = {
  filePath: string
  mtimeMs: number
  schedule: Schedule
}

let cache: ScheduleCache | null = null

function dataDirectory(): string {
  return path.join(process.cwd(), "data")
}

async function findScheduleFile(): Promise<string | null> {
  for (const name of CANDIDATE_NAMES) {
    const filePath = path.join(dataDirectory(), name)
    try {
      const info = await stat(filePath)
      if (info.isFile()) {
        return filePath
      }
    } catch {
      continue
    }
  }
  return null
}

export async function loadScheduleFromDisk(): Promise<Schedule | null> {
  const filePath = await findScheduleFile()
  if (!filePath) {
    cache = null
    return null
  }

  let info: Awaited<ReturnType<typeof stat>>
  try {
    info = await stat(filePath)
  } catch {
    cache = null
    return null
  }

  if (cache && cache.filePath === filePath && cache.mtimeMs === info.mtimeMs) {
    return cache.schedule
  }

  try {
    const buffer = await readFile(filePath)
    const schedule = await parseWorkbookBuffer(buffer, info.mtime.toISOString())
    cache = {
      filePath,
      mtimeMs: info.mtimeMs,
      schedule,
    }
    return schedule
  } catch {
    cache = null
    return null
  }
}
