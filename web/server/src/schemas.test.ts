import assert from 'node:assert/strict'
import test from 'node:test'
import { rsvpSchema } from './schemas.js'

const baseRsvp = {
  clientId: '00000000-0000-4000-8000-000000000010',
  name: '测试宾客',
  guestCount: 1,
  transportMode: '' as const,
  arrivalTime: '',
  arrivalLocation: '',
  message: '',
}

test('requires a complete arrival plan for confirmed guests', () => {
  const result = rsvpSchema.safeParse({ ...baseRsvp, attendance: 'yes' })

  assert.equal(result.success, false)
  if (result.success) return
  assert.deepEqual(
    result.error.issues.map((issue) => issue.message),
    ['请选择交通方式', '请选择到达时间', '请填写到达地点'],
  )
})

test('accepts a complete confirmed RSVP without phone or diet fields', () => {
  const result = rsvpSchema.safeParse({
    ...baseRsvp,
    attendance: 'yes',
    transportMode: '高铁',
    arrivalTime: '2026-09-12T10:30',
    arrivalLocation: '景德镇北站',
  })

  assert.equal(result.success, true)
})

test('allows an undecided or declined guest to omit the arrival plan', () => {
  assert.equal(rsvpSchema.safeParse({ ...baseRsvp, attendance: 'unsure' }).success, true)
  assert.equal(rsvpSchema.safeParse({ ...baseRsvp, attendance: 'no' }).success, true)
})

test('keeps cached declined replies compatible when new arrival fields are absent', () => {
  const legacyRsvp = {
    clientId: baseRsvp.clientId,
    name: baseRsvp.name,
    guestCount: baseRsvp.guestCount,
    message: baseRsvp.message,
  }

  assert.equal(rsvpSchema.safeParse({ ...legacyRsvp, attendance: 'no' }).success, true)
})
