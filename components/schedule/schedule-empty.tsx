"use client"

import { CalendarIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useLocale } from "@/hooks/use-locale"

export function ScheduleEmpty() {
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
    </Empty>
  )
}
