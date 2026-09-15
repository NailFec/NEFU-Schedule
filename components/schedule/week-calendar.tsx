"use client"

import { CourseBlock } from "@/components/schedule/course-block"
import { useLocale } from "@/hooks/use-locale"
import { placeMeetings } from "@/lib/schedule/layout"
import { meetingsForWeek } from "@/lib/schedule/query"
import { CANONICAL_PERIODS, PERIOD_COUNT } from "@/lib/schedule/periods"
import type { DayIndex, Schedule } from "@/lib/schedule/types"
import { cn } from "cn"

type WeekCalendarProps = {
  schedule: Schedule
  week: number
}

const DAY_INDEXES: DayIndex[] = [0, 1, 2, 3, 4, 5, 6]

function visibleDayIndexes(
  weeklyMeetings: ReturnType<typeof meetingsForWeek>
): DayIndex[] {
  return DAY_INDEXES.filter(
    (dayIndex) =>
      dayIndex <= 4 ||
      weeklyMeetings.some((meeting) => meeting.dayIndex === dayIndex)
  )
}

export function WeekCalendar({ schedule, week }: WeekCalendarProps) {
  const { t } = useLocale()
  const weeklyMeetings = meetingsForWeek(schedule, week)
  const days = visibleDayIndexes(weeklyMeetings)
  const lastPeriodIndex = CANONICAL_PERIODS.length - 1

  return (
    <div
      role="grid"
      aria-label={t.appTitle}
      className="grid h-full min-h-0 w-full overflow-hidden rounded-lg ring-1 ring-foreground/10"
      style={{
        gridTemplateColumns: `auto repeat(${days.length}, minmax(0, 1fr))`,
        gridTemplateRows: `auto repeat(${PERIOD_COUNT}, minmax(0, 1fr))`,
      }}
    >
      <div
        role="columnheader"
        className="bg-muted/40 px-1 py-2 text-xs font-medium text-muted-foreground sm:px-2"
        style={{ gridColumn: 1, gridRow: 1 }}
      >
        {t.period}
      </div>
      {days.map((dayIndex, columnIndex) => (
        <div
          key={dayIndex}
          role="columnheader"
          className="min-w-0 border-l border-solid bg-muted/40 px-0.5 py-2 text-center text-sm font-medium sm:px-1"
          style={{ gridColumn: columnIndex + 2, gridRow: 1 }}
        >
          <span className="block truncate sm:hidden">
            {t.daysShort[dayIndex]}
          </span>
          <span className="hidden truncate sm:block">{t.days[dayIndex]}</span>
        </div>
      ))}
      {CANONICAL_PERIODS.map((period, periodIndex) => {
        const isLastPeriod = periodIndex === lastPeriodIndex
        return (
          <div key={period.id} className="contents">
            <div
              role="rowheader"
              className={cn(
                "flex min-h-0 flex-col items-center justify-center px-1 text-center sm:items-end sm:px-2 sm:text-right",
                !isLastPeriod && "border-b border-dashed"
              )}
              style={{ gridColumn: 1, gridRow: periodIndex + 2 }}
            >
              <span className="text-xs leading-tight font-medium sm:hidden">
                {period.sectionNumber}
              </span>
              <span className="hidden text-xs leading-tight font-medium sm:block">
                {t.periodLabel(period.sectionNumber)}
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground tabular-nums sm:hidden">
                {period.startTime}
              </span>
              <span className="hidden text-[10px] leading-tight text-muted-foreground tabular-nums sm:block">
                {t.periodTime(period.startTime, period.endTime)}
              </span>
            </div>
            {days.map((dayIndex, columnIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  "min-h-0 min-w-0 border-l border-solid",
                  !isLastPeriod && "border-b border-dashed"
                )}
                style={{
                  gridColumn: columnIndex + 2,
                  gridRow: periodIndex + 2,
                }}
              />
            ))}
          </div>
        )
      })}
      {days.map((dayIndex, columnIndex) => {
        const placed = placeMeetings(
          weeklyMeetings.filter((meeting) => meeting.dayIndex === dayIndex)
        )
        return (
          <div
            key={dayIndex}
            role="presentation"
            className="relative min-h-0 min-w-0 border-l border-solid"
            style={{
              gridColumn: columnIndex + 2,
              gridRow: `2 / span ${PERIOD_COUNT}`,
            }}
          >
            {placed.map((item, index) => {
              const span = item.endSection - item.startSection + 1
              return (
                <div
                  key={`${item.meeting.title}-${item.startSection}-${index}`}
                  role="gridcell"
                  className="absolute overflow-hidden"
                  style={{
                    top: `calc(${(item.startSection - 1) / PERIOD_COUNT} * 100% + 0.125rem)`,
                    height: `calc(${span / PERIOD_COUNT} * 100% - 0.25rem)`,
                    left: `calc(${item.lane / item.lanes} * 100% + 0.125rem)`,
                    width: `calc(${1 / item.lanes} * 100% - 0.25rem)`,
                  }}
                >
                  <CourseBlock meeting={item.meeting} />
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
