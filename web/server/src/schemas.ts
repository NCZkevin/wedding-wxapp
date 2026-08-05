import { z } from 'zod'

const cleanText = (max: number) => z.string().trim().max(max)

export const rsvpSchema = z
  .object({
    clientId: z.string().uuid(),
    name: cleanText(30).min(1, '请填写姓名'),
    attendance: z.enum(['yes', 'unsure', 'no']),
    guestCount: z.coerce.number().int().min(1).max(6),
    transportMode: z.enum(['', '高铁', '飞机', '自驾', '其他']).default(''),
    arrivalTime: cleanText(30).refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value),
      '请填写正确的到达时间',
    ).default(''),
    arrivalLocation: cleanText(60).default(''),
    message: cleanText(300),
  })
  .superRefine((value, context) => {
    if (value.attendance !== 'yes') return

    const requiredArrivalFields = [
      ['transportMode', value.transportMode, '请选择交通方式'],
      ['arrivalTime', value.arrivalTime, '请选择到达时间'],
      ['arrivalLocation', value.arrivalLocation, '请填写到达地点'],
    ] as const
    for (const [path, field, message] of requiredArrivalFields) {
      if (!field) context.addIssue({ code: 'custom', path: [path], message })
    }
  })

export const blessingFieldsSchema = z.object({
  clientId: z.string().uuid(),
  name: cleanText(30).default(''),
  message: cleanText(300).default(''),
})
