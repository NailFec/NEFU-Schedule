"use client"

import * as React from "react"
import { UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { useLocale } from "@/hooks/use-locale"
import { parseScheduleFile } from "@/lib/schedule/parse-workbook"
import type { Schedule } from "@/lib/schedule/types"

type ImportScheduleButtonProps = {
  onImported: (schedule: Schedule) => void
}

export function ImportScheduleButton({ onImported }: ImportScheduleButtonProps) {
  const { t } = useLocale()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [importing, setImporting] = React.useState(false)

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) {
      return
    }

    setImporting(true)
    try {
      const schedule = await parseScheduleFile(file)
      onImported(schedule)
      toast.add({
        type: "success",
        description: t.importSuccess,
      })
    } catch {
      toast.add({
        type: "error",
        description: t.importError,
        priority: "high",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        onChange={onFileChange}
      />
      <Button
        disabled={importing}
        onClick={() => inputRef.current?.click()}
      >
        {importing ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <UploadIcon data-icon="inline-start" />
        )}
        {importing ? t.importing : t.importSchedule}
      </Button>
    </>
  )
}
