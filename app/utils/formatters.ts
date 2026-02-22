import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatResponseTime(ms: number | null): string {
  if (ms === null) return 'N/A'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function formatUptime(results: { status: string }[]): string {
  if (results.length === 0) return 'N/A'
  const successes = results.filter(r => r.status === 'success').length
  return `${((successes / results.length) * 100).toFixed(1)}%`
}

export function formatUptimePercent(percent: number | null): string {
  if (percent === null) return 'N/A'
  return `${percent.toFixed(1)}%`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'success': return 'text-success'
    case 'failure': return 'text-danger'
    case 'timeout': return 'text-warning'
    case 'error': return 'text-danger'
    default: return 'text-foreground-subtle'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'success': return 'bg-success-muted text-success'
    case 'failure': return 'bg-danger-muted text-danger'
    case 'timeout': return 'bg-warning-muted text-warning'
    case 'error': return 'bg-danger-muted text-danger'
    default: return 'bg-surface-raised text-foreground-subtle'
  }
}

export function getStatusDotColor(status: string | null): string {
  switch (status) {
    case 'success': return 'bg-success'
    case 'failure': return 'bg-danger'
    case 'timeout': return 'bg-warning'
    case 'error': return 'bg-danger'
    default: return 'bg-foreground-subtle'
  }
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return `${diffDay}d ago`
}
