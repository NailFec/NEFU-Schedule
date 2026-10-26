"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/hooks/use-locale"
import {
  formatWeekDateRange,
  todayCivilDate,
  weekContaining,
} from "@/lib/schedule/dates"

type WeekToolbarProps = {
  week: number
  minWeek: number
  maxWeek: number
  onWeekChange: (week: number) => void
}

export function WeekToolbar({
  week,
  minWeek,
  maxWeek,
  onWeekChange,
}: WeekToolbarProps) {
  const { locale, t } = useLocale()
  const todayWeek = weekContaining(todayCivilDate())
  const canGoToToday = todayWeek >= minWeek && todayWeek <= maxWeek
  const weeks = Array.from(
    { length: maxWeek - minWeek + 1 },
    (_, index) => minWeek + index
  )
  const items = weeks.map((value) => ({
    label: t.weekLabel(value, formatWeekDateRange(value, locale)),
    value: String(value),
  }))

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <ButtonGroup className="min-w-0 flex-1 sm:w-fit sm:flex-none">
        <Button
          variant="outline"
          size="icon"
          aria-label={t.previousWeek}
          disabled={week <= minWeek}
          onClick={() => onWeekChange(week - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        <Select
          items={items}
          value={String(week)}
          onValueChange={(value) => {
            if (value == null) {
              return
            }
            const next = Number(value)
            if (Number.isInteger(next)) {
              onWeekChange(next)
            }
          }}
        >
          <SelectTrigger
            aria-label={t.selectWeek}
            className="min-w-0 flex-1 sm:w-auto sm:min-w-56 sm:flex-none"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom">
            <SelectGroup>
              {items.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          aria-label={t.nextWeek}
          disabled={week >= maxWeek}
          onClick={() => onWeekChange(week + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </ButtonGroup>
      <Button
        variant="outline"
        disabled={!canGoToToday}
        onClick={() => onWeekChange(todayWeek)}
      >
        {t.today}
      </Button>
    </div>
  )
}
