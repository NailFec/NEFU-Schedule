import { scheduleToIcs } from "@/lib/schedule/ics"
import { loadRigelScheduleFromDisk } from "@/lib/schedule/load-schedule"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const schedule = await loadRigelScheduleFromDisk()
  if (!schedule) {
    return new Response("Schedule file not found.", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  }

  const body = scheduleToIcs(schedule, {
    namePrefix: "Rigel",
    uidNamespace: "nefu-rigel",
  })
  const filename = "rigel-feed.ics"

  return new Response(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  })
}
