import { z } from 'zod';
import type { AllQRData } from '../types/qr';

const nonEmptyTrimmed = z.string().trim().min(1, { message: 'qr.validation.required' });

const textSchema = z.object({
  type: z.literal('text'),
  content: nonEmptyTrimmed,
});

const urlSchema = z.object({
  type: z.literal('url'),
  url: nonEmptyTrimmed,
  protocol: z.enum(['http', 'https']),
});

const emailSchema = z.object({
  type: z.literal('email'),
  email: z
    .string()
    .trim()
    .min(1, { message: 'qr.validation.required' })
    .pipe(z.email({ message: 'qr.validation.invalid_email' })),
  subject: z.string().optional(),
  body: z.string().optional(),
});

const phoneSchema = z.object({
  type: z.literal('phone'),
  phone: nonEmptyTrimmed,
  countryCode: nonEmptyTrimmed,
});

const smsSchema = z.object({
  type: z.literal('sms'),
  phone: nonEmptyTrimmed,
  countryCode: nonEmptyTrimmed,
  message: z.string().optional(),
});

const wifiSchema = z
  .object({
    type: z.literal('wifi'),
    ssid: nonEmptyTrimmed,
    password: z.string(),
    encryption: z.enum(['WPA', 'WEP', 'nopass']),
    hidden: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.encryption !== 'nopass' && !data.password.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'qr.validation.required',
      });
    }
  });

const vcardSchema = z.object({
  type: z.literal('vcard'),
  firstName: nonEmptyTrimmed,
  lastName: nonEmptyTrimmed,
  phone: z.string().optional(),
  email: z.email().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
});

const geoSchema = z.object({
  type: z.literal('geo'),
  latitude: nonEmptyTrimmed,
  longitude: nonEmptyTrimmed,
});

const eventSchema = z.object({
  type: z.literal('event'),
  title: nonEmptyTrimmed,
  start: nonEmptyTrimmed,
  end: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const allQRDataSchema = z.discriminatedUnion('type', [
  textSchema,
  urlSchema,
  emailSchema,
  phoneSchema,
  smsSchema,
  wifiSchema,
  vcardSchema,
  geoSchema,
  eventSchema,
]);

export function validateQRData(data: AllQRData) {
  return allQRDataSchema.safeParse(data);
}

export type QRFieldErrors = Record<string, string>;

export function getQRFieldErrors(data: AllQRData): QRFieldErrors {
  const result = validateQRData(data);
  if (result.success) {
    return {};
  }

  const errors: QRFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key !== 'string') {
      continue;
    }
    if (errors[key]) {
      continue;
    }
    errors[key] = issue.message || 'qr.validation.invalid';
  }

  return errors;
}
