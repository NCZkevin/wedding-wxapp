import { timingSafeEqual } from 'node:crypto'

export type AdminAttendance = 'yes' | 'unsure' | 'no'

export interface AdminRsvpRecord {
  id: number
  name: string
  attendance: AdminAttendance
  guestCount: number
  transportMode: string
  arrivalTime: string | null
  arrivalLocation: string
  message: string
  updatedAt: string
}

export interface BlessingTotals {
  blessings: number
  photos: number
}

export function isAdminAuthorized(authorization: string | undefined, expectedToken: string) {
  if (!expectedToken || !authorization?.startsWith('Bearer ')) return false

  const supplied = Buffer.from(authorization.slice(7))
  const expected = Buffer.from(expectedToken)
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}

export function buildAdminDashboard(
  inputRows: AdminRsvpRecord[],
  blessingTotals: BlessingTotals,
  generatedAt = new Date().toISOString(),
) {
  const rsvps = inputRows.map((row) => ({
    ...row,
    id: Number(row.id),
    guestCount: Number(row.guestCount),
  }))
  const confirmed = rsvps.filter((row) => row.attendance === 'yes')
  const transports = new Map<string, number>()

  for (const row of rsvps) {
    if (!row.transportMode || row.attendance === 'no') continue
    transports.set(row.transportMode, (transports.get(row.transportMode) ?? 0) + 1)
  }

  const transportOrder = ['高铁', '飞机', '自驾', '其他']
  const transportStats = [...transports.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => {
      const leftIndex = transportOrder.indexOf(left.label)
      const rightIndex = transportOrder.indexOf(right.label)
      return (leftIndex < 0 ? transportOrder.length : leftIndex) - (rightIndex < 0 ? transportOrder.length : rightIndex)
    })

  return {
    generatedAt,
    summary: {
      replies: rsvps.length,
      confirmed: confirmed.length,
      unsure: rsvps.filter((row) => row.attendance === 'unsure').length,
      declined: rsvps.filter((row) => row.attendance === 'no').length,
      guests: confirmed.reduce((total, row) => total + row.guestCount, 0),
      arrivalPlans: rsvps.filter((row) => row.transportMode || row.arrivalTime || row.arrivalLocation).length,
      blessings: Number(blessingTotals.blessings),
      photos: Number(blessingTotals.photos),
    },
    transports: transportStats,
    rsvps,
  }
}
