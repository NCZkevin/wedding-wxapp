import assert from 'node:assert/strict'
import test from 'node:test'
import { createWeddingCalendar, formatIcsDate } from './calendar.js'

test('formats UTC dates for an ICS file', () => {
  assert.equal(formatIcsDate(new Date('2026-09-12T17:30:00+08:00')), '20260912T093000Z')
})

test('creates a valid wedding calendar envelope', () => {
  const calendar = createWeddingCalendar()
  assert.match(calendar, /^BEGIN:VCALENDAR\r\n/)
  assert.match(calendar, /SUMMARY:张凯文 × 刘明玥的婚礼/)
  assert.match(calendar, /DTSTART:20260912T090000Z/)
  assert.match(calendar, /DTEND:20260912T130000Z/)
  assert.match(calendar, /\r\nEND:VCALENDAR\r\n$/)
})
