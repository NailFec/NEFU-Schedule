"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useLocale } from "@/hooks/use-locale"
import type { ScheduleSource } from "@/lib/schedule/calendar-config"

export function ScheduleSourceToggle({
  source,
  onSourceChange,
}: {
  source: ScheduleSource
  onSourceChange: (source: ScheduleSource) => void
}) {
  const { t } = useLocale()

  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
      value={[source]}
      onValueChange={(value) => {
        const next = value[0]
        if (next === "default" || next === "rigel") {
          onSourceChange(next)
        }
      }}
      aria-label={t.scheduleSource}
    >
      <ToggleGroupItem value="default" aria-label={t.sourceDefault}>
        {t.sourceDefault}
      </ToggleGroupItem>
      <ToggleGroupItem value="rigel" aria-label={t.sourceRigel}>
        {t.sourceRigel}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
