"use client"

import { CalendarIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ImportScheduleButton } from "@/components/schedule/import-schedule-button"
import { useLocale } from "@/hooks/use-locale"
import type { Schedule } from "@/lib/schedule/types"

type ScheduleEmptyProps = {
  onImported: (schedule: Schedule) => void
}

export function ScheduleEmpty({ onImported }: ScheduleEmptyProps) {
  const { t } = useLocale()

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarIcon />
        </EmptyMedia>
        <EmptyTitle>{t.emptyTitle}</EmptyTitle>
        <EmptyDescription>{t.emptyDescription}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ImportScheduleButton onImported={onImported} />
      </EmptyContent>
    </Empty>
  )
}
