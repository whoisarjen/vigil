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
  headers: z.record(z.string(), z.string()).optional().default({}),
  body: z.string().optional().nullable(),
  enabled: z.coerce.boolean().default(true),
})

export const updateMonitorSchema = createMonitorSchema.partial()

// ============================================
// Status Pages
// ============================================

export const createStatusPageSchema = z.object({
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional().nullable(),
  isPublic: z.coerce.boolean().default(true),
  monitorIds: z.array(z.string()).optional().default([]),
})

export const updateStatusPageSchema = createStatusPageSchema.partial()

// ============================================
// Incidents
// ============================================

export const createIncidentSchema = z.object({
  statusPageId: z.string().min(1, 'Status page is required'),
  title: z.string().min(1, 'Title is required').max(200),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).default('investigating'),
  impact: z.enum(['none', 'minor', 'major', 'critical']).default('minor'),
  message: z.string().min(1, 'Message is required').max(2000),
  monitorIds: z.array(z.string()).optional().default([]),
})

export const updateIncidentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).optional(),
  impact: z.enum(['none', 'minor', 'major', 'critical']).optional(),
  message: z.string().min(1).max(2000).optional(),
})
