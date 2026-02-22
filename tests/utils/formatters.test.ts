import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  cn,
  formatResponseTime,
  formatUptime,
  formatUptimePercent,
  getStatusColor,
  getStatusBgColor,
  getStatusDotColor,
  formatRelativeTime,
} from '../../app/utils/formatters'

// ---------------------------------------------------------------------------
// cn()
// ---------------------------------------------------------------------------
describe('cn', () => {
  it('returns an empty string when called with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns a single class unchanged', () => {
    expect(cn('px-4')).toBe('px-4')
  })

  it('merges multiple non-conflicting classes', () => {
    const result = cn('px-4', 'py-2', 'font-bold')
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
    expect(result).toContain('font-bold')
  })

  it('resolves conflicting Tailwind classes (last wins)', () => {
    // tailwind-merge keeps the last conflicting utility
    const result = cn('px-4', 'px-8')
    expect(result).toBe('px-8')
  })

  it('resolves conflicting color classes', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles conditional classes via clsx syntax', () => {
    const isActive = true
    const isDisabled = false
    const result = cn('base', isActive && 'active', isDisabled && 'disabled')
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('disabled')
  })

  it('handles array inputs', () => {
    const result = cn(['px-4', 'py-2'])
    expect(result).toContain('px-4')
    expect(result).toContain('py-2')
  })

  it('handles object inputs', () => {
    const result = cn({ 'px-4': true, 'py-2': false, 'mt-2': true })
    expect(result).toContain('px-4')
    expect(result).not.toContain('py-2')
    expect(result).toContain('mt-2')
  })

  it('ignores falsy values (null, undefined, false, 0, empty string)', () => {
    const result = cn('px-4', null, undefined, false, 0, '', 'mt-2')
    expect(result).toBe('px-4 mt-2')
  })

  it('deduplicates identical classes', () => {
    const result = cn('px-4', 'px-4')
    expect(result).toBe('px-4')
  })
})

// ---------------------------------------------------------------------------
// formatResponseTime()
// ---------------------------------------------------------------------------
describe('formatResponseTime', () => {
  it('returns "N/A" for null input', () => {
    expect(formatResponseTime(null)).toBe('N/A')
  })

  it('formats 0ms', () => {
    expect(formatResponseTime(0)).toBe('0ms')
  })

  it('formats values below 1000 as milliseconds', () => {
    expect(formatResponseTime(1)).toBe('1ms')
    expect(formatResponseTime(250)).toBe('250ms')
    expect(formatResponseTime(999)).toBe('999ms')
  })

  it('formats exactly 1000ms as seconds', () => {
    expect(formatResponseTime(1000)).toBe('1.00s')
  })

  it('formats values above 1000 as seconds with two decimals', () => {
    expect(formatResponseTime(1500)).toBe('1.50s')
    expect(formatResponseTime(2345)).toBe('2.35s')
    expect(formatResponseTime(10000)).toBe('10.00s')
  })

  it('formats fractional milliseconds below 1000 as ms (integer input)', () => {
    // The function receives a number; if it is < 1000, it returns `${ms}ms`
    expect(formatResponseTime(500.5)).toBe('500.5ms')
  })

  it('formats large values correctly', () => {
    expect(formatResponseTime(60000)).toBe('60.00s')
  })
})

// ---------------------------------------------------------------------------
// formatUptime()
// ---------------------------------------------------------------------------
describe('formatUptime', () => {
  it('returns "N/A" for an empty array', () => {
    expect(formatUptime([])).toBe('N/A')
  })

  it('returns "100.0%" when all results are success', () => {
    const results = [
      { status: 'success' },
      { status: 'success' },
      { status: 'success' },
    ]
    expect(formatUptime(results)).toBe('100.0%')
  })

  it('returns "0.0%" when no results are success', () => {
    const results = [
      { status: 'failure' },
      { status: 'error' },
      { status: 'timeout' },
    ]
    expect(formatUptime(results)).toBe('0.0%')
  })

  it('calculates correct percentage for mixed results', () => {
    const results = [
      { status: 'success' },
      { status: 'failure' },
      { status: 'success' },
      { status: 'error' },
    ]
    // 2/4 = 50.0%
    expect(formatUptime(results)).toBe('50.0%')
  })

  it('handles a single success result', () => {
    expect(formatUptime([{ status: 'success' }])).toBe('100.0%')
  })

  it('handles a single failure result', () => {
    expect(formatUptime([{ status: 'failure' }])).toBe('0.0%')
  })

  it('only counts "success" status (not other statuses)', () => {
    const results = [
      { status: 'success' },
      { status: 'timeout' },
      { status: 'success' },
    ]
    // 2/3 = 66.7%
    expect(formatUptime(results)).toBe('66.7%')
  })

  it('calculates to one decimal place', () => {
    // 1/3 = 33.333... -> 33.3%
    const results = [
      { status: 'success' },
      { status: 'failure' },
      { status: 'failure' },
    ]
    expect(formatUptime(results)).toBe('33.3%')
  })
})

// ---------------------------------------------------------------------------
// formatUptimePercent()
// ---------------------------------------------------------------------------
describe('formatUptimePercent', () => {
  it('returns "N/A" for null input', () => {
    expect(formatUptimePercent(null)).toBe('N/A')
  })

  it('formats 100 as "100.0%"', () => {
    expect(formatUptimePercent(100)).toBe('100.0%')
  })

  it('formats 0 as "0.0%"', () => {
    expect(formatUptimePercent(0)).toBe('0.0%')
  })

  it('formats a decimal value with one decimal place', () => {
    expect(formatUptimePercent(99.95)).toBe('100.0%')
    expect(formatUptimePercent(99.94)).toBe('99.9%')
    expect(formatUptimePercent(50.55)).toBe('50.5%')
  })

  it('formats integer percentages with trailing .0', () => {
    expect(formatUptimePercent(75)).toBe('75.0%')
  })

  it('handles very small values', () => {
    expect(formatUptimePercent(0.1)).toBe('0.1%')
    expect(formatUptimePercent(0.04)).toBe('0.0%')
  })
})

// ---------------------------------------------------------------------------
// getStatusColor()
// ---------------------------------------------------------------------------
describe('getStatusColor', () => {
  it('returns "text-success" for "success"', () => {
    expect(getStatusColor('success')).toBe('text-success')
  })

  it('returns "text-danger" for "failure"', () => {
    expect(getStatusColor('failure')).toBe('text-danger')
  })

  it('returns "text-warning" for "timeout"', () => {
    expect(getStatusColor('timeout')).toBe('text-warning')
  })

  it('returns "text-danger" for "error"', () => {
    expect(getStatusColor('error')).toBe('text-danger')
  })

  it('returns "text-foreground-subtle" for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('text-foreground-subtle')
  })

  it('returns "text-foreground-subtle" for empty string', () => {
    expect(getStatusColor('')).toBe('text-foreground-subtle')
  })

  it('returns "text-foreground-subtle" for arbitrary strings', () => {
    expect(getStatusColor('pending')).toBe('text-foreground-subtle')
    expect(getStatusColor('active')).toBe('text-foreground-subtle')
  })
})

// ---------------------------------------------------------------------------
// getStatusBgColor()
// ---------------------------------------------------------------------------
describe('getStatusBgColor', () => {
  it('returns correct classes for "success"', () => {
    expect(getStatusBgColor('success')).toBe('bg-success-muted text-success')
  })

  it('returns correct classes for "failure"', () => {
    expect(getStatusBgColor('failure')).toBe('bg-danger-muted text-danger')
  })

  it('returns correct classes for "timeout"', () => {
    expect(getStatusBgColor('timeout')).toBe('bg-warning-muted text-warning')
  })

  it('returns correct classes for "error"', () => {
    expect(getStatusBgColor('error')).toBe('bg-danger-muted text-danger')
  })

  it('returns default classes for unknown status', () => {
    expect(getStatusBgColor('unknown')).toBe('bg-surface-raised text-foreground-subtle')
  })

  it('returns default classes for empty string', () => {
    expect(getStatusBgColor('')).toBe('bg-surface-raised text-foreground-subtle')
  })
})

// ---------------------------------------------------------------------------
// getStatusDotColor()
// ---------------------------------------------------------------------------
describe('getStatusDotColor', () => {
  it('returns "bg-success" for "success"', () => {
    expect(getStatusDotColor('success')).toBe('bg-success')
  })

  it('returns "bg-danger" for "failure"', () => {
    expect(getStatusDotColor('failure')).toBe('bg-danger')
  })

  it('returns "bg-warning" for "timeout"', () => {
    expect(getStatusDotColor('timeout')).toBe('bg-warning')
  })

  it('returns "bg-danger" for "error"', () => {
    expect(getStatusDotColor('error')).toBe('bg-danger')
  })

  it('returns "bg-foreground-subtle" for null', () => {
    expect(getStatusDotColor(null)).toBe('bg-foreground-subtle')
  })

  it('returns "bg-foreground-subtle" for unknown status', () => {
    expect(getStatusDotColor('unknown')).toBe('bg-foreground-subtle')
  })

  it('returns "bg-foreground-subtle" for empty string', () => {
    expect(getStatusDotColor('')).toBe('bg-foreground-subtle')
  })
})

// ---------------------------------------------------------------------------
// formatRelativeTime()
// ---------------------------------------------------------------------------
describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for a date less than 60 seconds ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:30Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('just now')
  })

  it('returns "just now" for a date exactly now', () => {
    vi.useFakeTimers()
    const now = new Date('2025-06-15T12:00:00Z')
    vi.setSystemTime(now)
    expect(formatRelativeTime(now)).toBe('just now')
  })

  it('returns minutes ago for 1-59 minutes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:05:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('5m ago')
  })

  it('returns "1m ago" at exactly 60 seconds', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:01:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('1m ago')
  })

  it('returns "59m ago" at 59 minutes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:59:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('59m ago')
  })

  it('returns hours ago for 1-23 hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T15:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('3h ago')
  })

  it('returns "1h ago" at exactly 60 minutes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T13:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('1h ago')
  })

  it('returns "23h ago" at 23 hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-16T11:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('23h ago')
  })

  it('returns days ago for 24+ hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-18T12:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('3d ago')
  })

  it('returns "1d ago" at exactly 24 hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-16T12:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('1d ago')
  })

  it('accepts an ISO date string', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:10:00Z'))
    expect(formatRelativeTime('2025-06-15T12:00:00Z')).toBe('10m ago')
  })

  it('accepts a Date object', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('2h ago')
  })

  it('handles large day differences', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-07-15T12:00:00Z'))
    expect(formatRelativeTime(new Date('2025-06-15T12:00:00Z'))).toBe('30d ago')
  })
})
