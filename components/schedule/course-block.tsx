"use client"

import { MapPinIcon, UserIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  courseTintClassName,
  courseTintForTitle,
} from "@/lib/schedule/course-tint"
import type { Meeting } from "@/lib/schedule/types"
import { cn } from "cn"

type CourseBlockProps = {
  meeting: Meeting
}

function MeetingChips({ meeting }: { meeting: Meeting }) {
  return (
    <>
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
  const tint = courseTintForTitle(meeting.title)

  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={200}
        closeDelay={100}
        className={cn(
          "flex size-full min-h-0 min-w-0 items-start overflow-hidden rounded-md px-1.5 py-1 text-left text-foreground ring-1 ring-foreground/10 focus-visible:ring-2 focus-visible:ring-ring",
          courseTintClassName[tint]
        )}
      >
        <span className="flex min-h-0 w-full min-w-0 flex-col items-start gap-1">
          <span className="font-medium text-wrap">{meeting.title}</span>
          <MeetingChips meeting={meeting} />
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
