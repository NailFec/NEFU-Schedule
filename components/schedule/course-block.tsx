"use client"

import { ClockIcon, MapPinIcon, UserIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocale } from "@/hooks/use-locale"
import {
  courseTintClassName,
  courseTintForTitle,
} from "@/lib/schedule/course-tint"
import { meetingTimeRange } from "@/lib/schedule/periods"
import type { Meeting } from "@/lib/schedule/types"
import { cn } from "cn"

type CourseBlockProps = {
  meeting: Meeting
}

function meetingTimeLabel(
  meeting: Meeting,
  periodTime: (startTime: string, endTime: string) => string
): string | null {
  const range = meetingTimeRange(meeting.sectionNumbers)
  if (!range) {
    return null
  }
  return periodTime(range.startTime, range.endTime)
}

function MeetingChips({ meeting }: { meeting: Meeting }) {
  const { t } = useLocale()
  const timeLabel = meetingTimeLabel(meeting, t.periodTime)

  return (
    <>
      {timeLabel ? (
        <Badge
          variant="secondary"
          className="h-auto max-w-full justify-start whitespace-normal"
        >
          <ClockIcon data-icon="inline-start" />
          {timeLabel}
        </Badge>
      ) : null}
      {meeting.instructors.map((name, index) => (
        <Badge
          key={`${name}-${index}`}
          variant="secondary"
          className="h-auto max-w-full justify-start whitespace-normal"
        >
          <UserIcon data-icon="inline-start" />
          {name}
        </Badge>
      ))}
      {meeting.location ? (
        <Badge
          variant="secondary"
          className="h-auto max-w-full justify-start whitespace-normal"
        >
          <MapPinIcon data-icon="inline-start" />
          {meeting.location}
        </Badge>
      ) : null}
    </>
  )
}

export function CourseBlock({ meeting }: CourseBlockProps) {
  const { t } = useLocale()
  const tint = courseTintForTitle(meeting.title)
  const timeLabel = meetingTimeLabel(meeting, t.periodTime)

  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={200}
        closeDelay={100}
        className={cn(
          "flex size-full min-h-0 min-w-0 items-start overflow-hidden rounded-md px-1 py-0.5 text-left text-foreground ring-1 ring-foreground/10 touch-manipulation focus-visible:ring-2 focus-visible:ring-ring sm:px-1.5 sm:py-1",
          courseTintClassName[tint]
        )}
      >
        <span className="flex min-h-0 w-full min-w-0 flex-col items-start gap-0.5">
          <span className="text-[11px] leading-tight font-medium sm:text-sm">
            {meeting.title}
          </span>
          {timeLabel ? (
            <span className="text-[10px] leading-tight text-muted-foreground tabular-nums sm:text-xs">
              {timeLabel}
            </span>
          ) : null}
          {meeting.location ? (
            <span className="text-[10px] leading-tight text-muted-foreground sm:text-xs">
              {meeting.location}
            </span>
          ) : null}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-72 max-w-[calc(100vw-2rem)]">
        <PopoverHeader>
          <PopoverTitle className="text-wrap">{meeting.title}</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col items-start gap-1">
          <MeetingChips meeting={meeting} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
