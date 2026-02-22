export type Plan = 'free' | 'pro'

export type MonitorStatus = 'success' | 'failure' | 'timeout' | 'error'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  image: string | null
  plan: Plan
}

export interface MonitorWithLatest {
  id: string
  name: string
  url: string
  method: HttpMethod
  expectedStatus: number
  timeoutMs: number
  scheduleInterval: number
  enabled: boolean
  createdAt: string
  latestStatus: MonitorStatus | null
  latestResponseTime: number | null
  latestCheckedAt: string | null
  uptimePercent: number | null
}

export const PLANS = {
  free: {
    name: 'Free',
    maxMonitors: 5,
    historyDays: 7,
    maxTimeoutMs: 15_000,
  },
  pro: {
    name: 'Pro',
    maxMonitors: 50,
    historyDays: 90,
    maxTimeoutMs: 30_000,
  },
} as const

export const SCHEDULE_INTERVALS = [
  { value: 15, label: 'Every 15 minutes' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
  { value: 120, label: 'Every 2 hours' },
  { value: 360, label: 'Every 6 hours' },
  { value: 720, label: 'Every 12 hours' },
  { value: 1440, label: 'Every 24 hours' },
] as const

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']

export const TIMEOUT_OPTIONS = [
  { value: 1000, label: '1 second' },
  { value: 2000, label: '2 seconds' },
  { value: 3000, label: '3 seconds' },
  { value: 5000, label: '5 seconds' },
  { value: 10000, label: '10 seconds' },
  { value: 15000, label: '15 seconds' },
] as const
