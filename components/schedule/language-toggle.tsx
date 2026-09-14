"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useLocale } from "@/hooks/use-locale"
import type { Locale } from "@/lib/i18n/messages"

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale()

  return (
    <ToggleGroup
      variant="outline"
      spacing={0}
      value={[locale]}
      onValueChange={(value) => {
        const next = value[0]
        if (next === "zh" || next === "en") {
          setLocale(next as Locale)
        }
      }}
      aria-label={t.language}
    >
      <ToggleGroupItem value="zh" aria-label={t.chinese}>
        {t.chinese}
      </ToggleGroupItem>
      <ToggleGroupItem value="en" aria-label={t.english}>
        {t.english}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
