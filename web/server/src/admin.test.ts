import assert from 'node:assert/strict'
import test from 'node:test'
import { buildAdminDashboard, isAdminAuthorized, type AdminRsvpRecord } from './admin.js'

test('accepts only the exact configured admin bearer token', () => {
  assert.equal(isAdminAuthorized(undefined, 'secret-token'), false)
  assert.equal(isAdminAuthorized('Bearer wrong-token', 'secret-token'), false)
  assert.equal(isAdminAuthorized('Bearer secret-token', 'secret-token'), true)
  assert.equal(isAdminAuthorized('Bearer secret-token', ''), false)
})

test('builds RSVP, guest, arrival, transport and blessing summaries', () => {
  const rsvps: AdminRsvpRecord[] = [
    {
      id: 1,
      name: '甲',
      attendance: 'yes',
      guestCount: 2,
      transportMode: '高铁',
      arrivalTime: '2026-09-12T10:30',
      arrivalLocation: '景德镇北站',
      message: '',
      updatedAt: '2026-08-06T10:00:00',
    },
    {
      id: 2,
      name: '乙',
      attendance: 'yes',
      guestCount: 1,
      transportMode: '',
      arrivalTime: null,
      arrivalLocation: '',
      message: '祝福',
      updatedAt: '2026-08-06T11:00:00',
    },
    {
      id: 3,
      name: '丙',
      attendance: 'unsure',
      guestCount: 1,
      transportMode: '飞机',
      arrivalTime: null,
      arrivalLocation: '',
      message: '',
      updatedAt: '2026-08-06T12:00:00',
    },
    {
      id: 4,
      name: '丁',
      attendance: 'no',
      guestCount: 1,
      transportMode: '',
      arrivalTime: null,
      arrivalLocation: '',
      message: '',
      updatedAt: '2026-08-06T13:00:00',
    },
  ]

  const dashboard = buildAdminDashboard(rsvps, { blessings: 5, photos: 8 }, '2026-08-06T14:00:00.000Z')

  assert.deepEqual(dashboard.summary, {
    replies: 4,
    confirmed: 2,
    unsure: 1,
    declined: 1,
    guests: 3,
    arrivalPlans: 2,
    blessings: 5,
    photos: 8,
  })
  assert.deepEqual(dashboard.transports, [
    { label: '高铁', count: 1 },
    { label: '飞机', count: 1 },
  ])
})
