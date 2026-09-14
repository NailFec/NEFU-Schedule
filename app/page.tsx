import { ScheduleApp } from "@/components/schedule/schedule-app"
import { LocaleProvider } from "@/hooks/use-locale"

export default function Page() {
  return (
    <LocaleProvider>
      <ScheduleApp />
    </LocaleProvider>
  )
}
