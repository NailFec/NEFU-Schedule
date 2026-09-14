import { ScheduleApp } from "@/components/schedule/schedule-app"
import { LocaleProvider } from "@/hooks/use-locale"
import { loadScheduleFromDisk } from "@/lib/schedule/load-schedule"

export const dynamic = "force-dynamic"

export default async function Page() {
  const schedule = await loadScheduleFromDisk()

  return (
    <LocaleProvider>
      <ScheduleApp schedule={schedule} />
    </LocaleProvider>
  )
}
