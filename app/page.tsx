import { ScheduleApp } from "@/components/schedule/schedule-app"
import { LocaleProvider } from "@/hooks/use-locale"
import {
  loadRigelScheduleFromDisk,
  loadScheduleFromDisk,
} from "@/lib/schedule/load-schedule"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [defaultSchedule, rigelSchedule] = await Promise.all([
    loadScheduleFromDisk(),
    loadRigelScheduleFromDisk(),
  ])

  return (
    <LocaleProvider>
      <ScheduleApp
        schedules={{
          default: defaultSchedule,
          rigel: rigelSchedule,
        }}
      />
    </LocaleProvider>
  )
}
