const pad = (value: number) => String(value).padStart(2, '0')

export function formatIcsDate(date: Date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    'T',
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    'Z',
  ].join('')
}

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

export function createWeddingCalendar() {
  const start = new Date('2026-09-12T17:00:00+08:00')
  const end = new Date('2026-09-12T21:00:00+08:00')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NCZKEVIN//Wedding Invitation//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:wedding-20260912@wedding.nczkevin.com',
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcs('张凯文 × 刘明玥的婚礼')}`,
    `LOCATION:${escapeIcs('乐平山水国际酒店，江西省景德镇市乐平市后港镇大山坞666号')}`,
    `DESCRIPTION:${escapeIcs('诚邀你见证我们的婚礼。建议于仪式开始前30分钟到场。')}`,
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs('明天见｜张凯文 × 刘明玥的婚礼')}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.join('\r\n')}\r\n`
}
