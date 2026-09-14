import type { Meeting } from "@/lib/schedule/types"

export type PlacedMeeting = {
  meeting: Meeting
  startSection: number
  endSection: number
  lane: number
  lanes: number
}

export function placeMeetings(meetings: Meeting[]): PlacedMeeting[] {
  const items: PlacedMeeting[] = meetings
    .map((meeting) => {
      const sections = meeting.sectionNumbers.filter(
        (section) => Number.isInteger(section) && section >= 1 && section <= 16
      )
      if (sections.length === 0) {
        return null
      }
      return {
        meeting,
        startSection: Math.min(...sections),
        endSection: Math.max(...sections),
        lane: 0,
        lanes: 1,
      }
    })
    .filter((item): item is PlacedMeeting => item != null)
    .sort(
      (left, right) =>
        left.startSection - right.startSection ||
        right.endSection - left.endSection
    )

  const laneEnds: number[] = []
  for (const item of items) {
    let lane = laneEnds.findIndex((end) => end < item.startSection)
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(item.endSection)
    } else {
      laneEnds[lane] = item.endSection
    }
    item.lane = lane
  }

  for (const item of items) {
    const overlapping = items.filter(
      (other) =>
        other.startSection <= item.endSection &&
        other.endSection >= item.startSection
    )
    item.lanes = Math.max(...overlapping.map((other) => other.lane)) + 1
  }

  return items
}
