export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as { message?: string } & T
  if (!response.ok) {
    throw new ApiError(data.message || '请求失败，请稍后再试', response.status)
  }
  return data
}

export async function submitRsvp(payload: RsvpPayload) {
  return parseResponse<{ id: number; updated: boolean }>(
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  )
}

export async function submitBlessing(payload: FormData) {
  return parseResponse<{ id: number; photoCount: number }>(
    await fetch('/api/blessings', {
      method: 'POST',
      body: payload,
    }),
  )
}

export async function getAdminDashboard(token: string) {
  return parseResponse<AdminDashboard>(
    await fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }),
  )
}

export async function downloadAdminRsvpCsv(token: string) {
  const response = await fetch('/api/admin/rsvp.csv', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!response.ok) await parseResponse<never>(response)
  return response.blob()
}

export interface RsvpPayload {
  clientId: string
  name: string
  attendance: 'yes' | 'unsure' | 'no'
  guestCount: number
  transportMode: '' | '高铁' | '飞机' | '自驾' | '其他'
  arrivalTime: string
  arrivalLocation: string
  message: string
}

export interface AdminRsvpRecord {
  id: number
  name: string
  attendance: 'yes' | 'unsure' | 'no'
  guestCount: number
  transportMode: string
  arrivalTime: string | null
  arrivalLocation: string
  message: string
  updatedAt: string
}

export interface AdminDashboard {
  generatedAt: string
  summary: {
    replies: number
    confirmed: number
    unsure: number
    declined: number
    guests: number
    arrivalPlans: number
    blessings: number
    photos: number
  }
  transports: Array<{ label: string; count: number }>
  rsvps: AdminRsvpRecord[]
  blessings: AdminBlessingRecord[]
}

export interface AdminBlessingRecord {
  id: number
  name: string
  message: string
  photoCount: number
  createdAt: string
}
