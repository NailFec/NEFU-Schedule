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

const caches = new Map<string, ScheduleCache | null>()

const RIGEL_DIRECTORY_NAME = "rigel"

function dataDirectory(): string {
  return path.join(process.cwd(), "data")
}

function rigelDirectory(): string {
  return path.join(dataDirectory(), RIGEL_DIRECTORY_NAME)
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

async function listHtmlFiles(
  root: string,
  skipDirectoryNames: ReadonlySet<string>
): Promise<string[]> {
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
        if (skipDirectoryNames.has(entry.name)) {
          continue
        }
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

async function loadScheduleFromDirectory(
  root: string,
  skipDirectoryNames: ReadonlySet<string>
): Promise<Schedule | null> {
  const files = await listHtmlFiles(root, skipDirectoryNames)
  if (files.length === 0) {
    caches.set(root, null)
    return null
  }

  for (const filePath of files) {
    let info: Awaited<ReturnType<typeof stat>>
    try {
      info = await stat(filePath)
    } catch {
      continue
    }

    const cache = caches.get(root)
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
      caches.set(root, {
        filePath,
        mtimeMs: info.mtimeMs,
        schedule,
      })
      return schedule
    } catch {
      continue
    }
  }

  caches.set(root, null)
  return null
}

export function loadScheduleFromDisk(): Promise<Schedule | null> {
  return loadScheduleFromDirectory(
    dataDirectory(),
    new Set([RIGEL_DIRECTORY_NAME])
  )
}

export function loadRigelScheduleFromDisk(): Promise<Schedule | null> {
  return loadScheduleFromDirectory(rigelDirectory(), new Set())
}
