import { z } from 'zod';
import mongoose from 'mongoose';
import { GENERAL_PLACEMENTS, SERVICE_TYPES } from '../models/AnalyticsEvent.js';

// A route path only: starts with "/", no spaces, query string or hash
const pagePath = z
  .string()
  .trim()
  .max(300)
  .regex(/^\/[^\s?#]*$/, { error: 'pagePath must be a path like /about' });

const objectId = z.string().refine((id) => mongoose.isValidObjectId(id), { error: 'serviceId must be a valid id' });

// POST /api/v1/analytics/events — strict: no other fields (and so no personal data) are accepted
export const analyticsEventSchema = z.discriminatedUnion('eventType', [
  z.strictObject({
    eventType: z.literal('page_view'),
    pagePath,
  }),
  z.strictObject({
    eventType: z.literal('service_whatsapp_click'),
    serviceType: z.enum(SERVICE_TYPES),
    serviceId: objectId,
    pagePath,
  }),
  z.strictObject({
    eventType: z.literal('general_whatsapp_click'),
    placement: z.enum(GENERAL_PLACEMENTS),
    pagePath,
  }),
]);
