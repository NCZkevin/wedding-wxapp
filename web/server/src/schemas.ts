import { z } from 'zod'

const cleanText = (max: number) => z.string().trim().max(max)

export const rsvpSchema = z
  .object({
    clientId: z.string().uuid(),
    name: cleanText(30).min(1, '请填写姓名'),
    phone: cleanText(20),
    attendance: z.enum(['yes', 'unsure', 'no']),
    guestCount: z.coerce.number().int().min(1).max(6),
    diet: cleanText(100),
    message: cleanText(300),
  })
  .superRefine((value, context) => {
    if (value.attendance !== 'no' && !/^1\d{10}$/.test(value.phone)) {
      context.addIssue({
        code: 'custom',
        path: ['phone'],
        message: '请填写正确的手机号码',
      })
    }
  })

export const blessingFieldsSchema = z.object({
  clientId: z.string().uuid(),
  name: cleanText(30).default(''),
  message: cleanText(300).default(''),
})
