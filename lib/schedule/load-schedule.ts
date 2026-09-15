import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"

import {
  htmlLooksLikeSchedule,
  parseScheduleHtml,
} from "@/lib/schedule/parse-html"
import type { Schedule } from "@/lib/schedule/types"

type ScheduleCache = {
  filePath: string
  mtimeMs: number
  schedule: Schedule
}

let cache: ScheduleCache | null = null

function dataDirectory(): string {
  return path.join(process.cwd(), "data")
}

function htmlPriority(filePath: string): number {
  const name = path.basename(filePath).toLowerCase()
  if (name === "schedule.html") {
    return 0
  }
  if (name.startsWith("xskb_list")) {
    return 1
  }
  return 2
}

async function listHtmlFiles(root: string): Promise<string[]> {
  const files: string[] = []

  async function walk(directory: string) {
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
        continue
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
        files.push(fullPath)
      }
    }
  }

  await walk(root)
  return files.sort((left, right) => {
    const priority = htmlPriority(left) - htmlPriority(right)
    if (priority !== 0) {
      return priority
    }
    return left.localeCompare(right)
  })
}

export async function loadScheduleFromDisk(): Promise<Schedule | null> {
  const files = await listHtmlFiles(dataDirectory())
  if (files.length === 0) {
    cache = null
    return null
  }

  for (const filePath of files) {
    let info: Awaited<ReturnType<typeof stat>>
    try {
      info = await stat(filePath)
    } catch {
      continue
    }

    if (
      cache &&
      cache.filePath === filePath &&
      cache.mtimeMs === info.mtimeMs
    ) {
      return cache.schedule
    }

    let html: string
    try {
      html = await readFile(filePath, "utf8")
    } catch {
      continue
    }

    if (!htmlLooksLikeSchedule(html)) {
      continue
    }

    try {
      const schedule = parseScheduleHtml(html, info.mtime.toISOString())
      cache = {
        filePath,
        mtimeMs: info.mtimeMs,
        schedule,
      }
      return schedule
    } catch {
      continue
    }
  }

  cache = null
  return null
}
