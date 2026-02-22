import { z } from 'zod'

export const createMonitorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  url: z.string().url('Must be a valid URL'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']).default('GET'),
  expectedStatus: z.coerce.number().int().min(100).max(599).default(200),
  timeoutMs: z.coerce.number().int().min(1000).max(15000).default(5000),
  scheduleInterval: z.coerce.number().int().refine(
    v => [15, 30, 60, 120, 360, 720, 1440].includes(v),
    'Invalid schedule interval',
  ),
  headers: z.record(z.string()).optional().default({}),
  body: z.string().optional().nullable(),
  enabled: z.coerce.boolean().default(true),
  statuspageApiKey: z.string().optional().nullable(),
  statuspagePageId: z.string().optional().nullable(),
  statuspageComponentId: z.string().optional().nullable(),
  betteruptimeHeartbeatUrl: z.string().url().optional().nullable().or(z.literal('')),
})

export const updateMonitorSchema = createMonitorSchema.partial()
