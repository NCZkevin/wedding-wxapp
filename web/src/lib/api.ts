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

export interface RsvpPayload {
  clientId: string
  name: string
  phone: string
  attendance: 'yes' | 'unsure' | 'no'
  guestCount: number
  diet: string
  message: string
}
