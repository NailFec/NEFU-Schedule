"use client"

import * as React from "react"
import { StickyNoteIcon } from "lucide-react"

import { LanguageToggle } from "@/components/schedule/language-toggle"
import { ScheduleEmpty } from "@/components/schedule/schedule-empty"
import { SubscribeFeedButton } from "@/components/schedule/subscribe-feed-button"
import { WeekCalendar } from "@/components/schedule/week-calendar"
import { WeekToolbar } from "@/components/schedule/week-toolbar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/hooks/use-locale"
import {
  firstWeekWithMeetings,
  getWeekRange,
} from "@/lib/schedule/parse-workbook"
import { loadSelectedWeek, saveSelectedWeek } from "@/lib/schedule/storage"
import type { Schedule } from "@/lib/schedule/types"

function MetadataFields({
  items,
}: {
  items: Array<{ label: string; value: string | null }>
}) {
  const visible = items.filter(
    (item): item is { label: string; value: string } => Boolean(item.value)
  )

  if (visible.length === 0) {
    return null
  }

  return (
    <p className="truncate text-sm text-muted-foreground">
      {visible.map((item, index) => (
        <span key={item.label}>
          {index > 0 ? " · " : null}
          {item.label}: {item.value}
        </span>
      ))}
    </p>
  )
}

export function ScheduleApp({ schedule }: { schedule: Schedule | null }) {
  const { t, ready: localeReady } = useLocale()
  const [week, setWeek] = React.useState(1)
  const [storageReady, setStorageReady] = React.useState(false)

  React.useEffect(() => {
    if (schedule) {
      const { minWeek, maxWeek } = getWeekRange(schedule)
      const savedWeek = loadSelectedWeek()
      if (savedWeek != null && savedWeek >= minWeek && savedWeek <= maxWeek) {
        setWeek(savedWeek)
      } else {
        setWeek(firstWeekWithMeetings(schedule))
      }
    }
    setStorageReady(true)
  }, [schedule])

  function onWeekChange(nextWeek: number) {
    setWeek(nextWeek)
    saveSelectedWeek(nextWeek)
  }

  const ready = localeReady && storageReady

  React.useEffect(() => {
    if (!ready) {
      return
    }
    document.title = t.appTitle
  }, [ready, t.appTitle])

  if (!ready) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="min-h-0 flex-1 p-3">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    )
  }

  const range = schedule ? getWeekRange(schedule) : null

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col gap-2 border-b px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-base font-medium">{t.appTitle}</h1>
            {schedule ? (
              <MetadataFields
                items={[
                  {
                    label: t.studentName,
                    value: schedule.metadata.studentName,
                  },
                  {
                    label: t.academicTerm,
                    value: schedule.metadata.academicTerm,
                  },
                  { label: t.className, value: schedule.metadata.className },
                  { label: t.major, value: schedule.metadata.major },
                  { label: t.department, value: schedule.metadata.department },
                  { label: t.university, value: schedule.metadata.university },
                  { label: t.printedAt, value: schedule.metadata.printedAt },
                ]}
              />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {schedule && range ? (
              <WeekToolbar
                week={week}
                minWeek={range.minWeek}
                maxWeek={range.maxWeek}
                onWeekChange={onWeekChange}
              />
            ) : null}
            {schedule ? <SubscribeFeedButton /> : null}
            <LanguageToggle />
          </div>
        </div>
        {schedule && schedule.notes.length > 0 ? (
          <Alert>
            <StickyNoteIcon />
            <AlertTitle>{t.notesTitle}</AlertTitle>
            <AlertDescription>
              <div className="flex max-h-16 flex-col gap-1 overflow-hidden">
                {schedule.notes.map((note) => (
                  <p key={note} className="truncate">
                    {note}
                  </p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        ) : null}
      </header>
      {schedule && range ? (
        <div className="min-h-0 flex-1 p-3">
          <WeekCalendar schedule={schedule} week={week} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <ScheduleEmpty />
        </div>
      )}
    </div>
  )
}
