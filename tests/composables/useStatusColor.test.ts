import { describe, it, expect, vi, afterEach } from 'vitest'
import { useStatusColor } from '../../app/composables/useStatusColor'

// Instantiate the composable once; all returned functions are pure so sharing
// is safe across tests.
const {
  statusVariant,
  statusDotColor,
  statusLabel,
  statusTextColor,
  incidentStatusVariant,
  incidentImpactVariant,
  uptimeColor,
  timeAgo,
} = useStatusColor()

// ---------------------------------------------------------------------------
// statusVariant()
// ---------------------------------------------------------------------------
describe('statusVariant', () => {
  it('returns "success" for "success"', () => {
    expect(statusVariant('success')).toBe('success')
  })

  it('returns "warning" for "timeout"', () => {
    expect(statusVariant('timeout')).toBe('warning')
  })

  it('returns "danger" for "failure"', () => {
    expect(statusVariant('failure')).toBe('danger')
  })

  it('returns "danger" for "error"', () => {
    expect(statusVariant('error')).toBe('danger')
  })

  it('returns "default" for null', () => {
    expect(statusVariant(null)).toBe('default')
  })

  it('returns "default" for unknown string', () => {
    expect(statusVariant('unknown')).toBe('default')
  })

  it('returns "default" for empty string', () => {
    expect(statusVariant('')).toBe('default')
  })

  it('returns "default" for arbitrary string', () => {
    expect(statusVariant('pending')).toBe('default')
  })
})

// ---------------------------------------------------------------------------
// statusDotColor()
// ---------------------------------------------------------------------------
describe('statusDotColor', () => {
  it('returns "bg-success" for "success"', () => {
    expect(statusDotColor('success')).toBe('bg-success')
  })

  it('returns "bg-warning" for "timeout"', () => {
    expect(statusDotColor('timeout')).toBe('bg-warning')
  })

  it('returns "bg-danger" for "failure"', () => {
    expect(statusDotColor('failure')).toBe('bg-danger')
  })

  it('returns "bg-danger" for "error"', () => {
    expect(statusDotColor('error')).toBe('bg-danger')
  })

  it('returns "bg-foreground-subtle" for null', () => {
    expect(statusDotColor(null)).toBe('bg-foreground-subtle')
  })

  it('returns "bg-foreground-subtle" for unknown string', () => {
    expect(statusDotColor('unknown')).toBe('bg-foreground-subtle')
  })

  it('returns "bg-foreground-subtle" for empty string', () => {
    expect(statusDotColor('')).toBe('bg-foreground-subtle')
  })
})

// ---------------------------------------------------------------------------
// statusLabel()
// ---------------------------------------------------------------------------
describe('statusLabel', () => {
  it('returns "Operational" for "success"', () => {
    expect(statusLabel('success')).toBe('Operational')
  })

  it('returns "Degraded" for "timeout"', () => {
    expect(statusLabel('timeout')).toBe('Degraded')
  })

  it('returns "Down" for "failure"', () => {
    expect(statusLabel('failure')).toBe('Down')
  })

  it('returns "Down" for "error"', () => {
    expect(statusLabel('error')).toBe('Down')
  })

  it('returns "Unknown" for null', () => {
    expect(statusLabel(null)).toBe('Unknown')
  })

  it('returns "Unknown" for unknown string', () => {
    expect(statusLabel('anything')).toBe('Unknown')
  })

  it('returns "Unknown" for empty string', () => {
    expect(statusLabel('')).toBe('Unknown')
  })
})

// ---------------------------------------------------------------------------
// statusTextColor()
// ---------------------------------------------------------------------------
describe('statusTextColor', () => {
  it('returns "text-success" for "success"', () => {
    expect(statusTextColor('success')).toBe('text-success')
  })

  it('returns "text-warning" for "timeout"', () => {
    expect(statusTextColor('timeout')).toBe('text-warning')
  })

  it('returns "text-danger" for "failure"', () => {
    expect(statusTextColor('failure')).toBe('text-danger')
  })

  it('returns "text-danger" for "error"', () => {
    expect(statusTextColor('error')).toBe('text-danger')
  })

  it('returns "text-foreground-subtle" for null', () => {
    expect(statusTextColor(null)).toBe('text-foreground-subtle')
  })

  it('returns "text-foreground-subtle" for unknown string', () => {
    expect(statusTextColor('other')).toBe('text-foreground-subtle')
  })

  it('returns "text-foreground-subtle" for empty string', () => {
    expect(statusTextColor('')).toBe('text-foreground-subtle')
  })
})

// ---------------------------------------------------------------------------
// incidentStatusVariant()
// ---------------------------------------------------------------------------
describe('incidentStatusVariant', () => {
  it('returns "success" for "resolved"', () => {
    expect(incidentStatusVariant('resolved')).toBe('success')
  })

  it('returns "accent" for "monitoring"', () => {
    expect(incidentStatusVariant('monitoring')).toBe('accent')
  })

  it('returns "warning" for "identified"', () => {
    expect(incidentStatusVariant('identified')).toBe('warning')
  })

  it('returns "danger" for "investigating"', () => {
    expect(incidentStatusVariant('investigating')).toBe('danger')
  })

  it('returns "default" for unknown string', () => {
    expect(incidentStatusVariant('unknown')).toBe('default')
  })

  it('returns "default" for empty string', () => {
    expect(incidentStatusVariant('')).toBe('default')
  })

  it('returns "default" for arbitrary strings', () => {
    expect(incidentStatusVariant('open')).toBe('default')
    expect(incidentStatusVariant('closed')).toBe('default')
  })
})

// ---------------------------------------------------------------------------
// incidentImpactVariant()
// ---------------------------------------------------------------------------
describe('incidentImpactVariant', () => {
  it('returns "default" for "none"', () => {
    expect(incidentImpactVariant('none')).toBe('default')
  })

  it('returns "warning" for "minor"', () => {
    expect(incidentImpactVariant('minor')).toBe('warning')
  })

  it('returns "danger" for "major"', () => {
    expect(incidentImpactVariant('major')).toBe('danger')
  })

  it('returns "danger" for "critical"', () => {
    expect(incidentImpactVariant('critical')).toBe('danger')
  })

  it('returns "default" for unknown string', () => {
    expect(incidentImpactVariant('unknown')).toBe('default')
  })

  it('returns "default" for empty string', () => {
    expect(incidentImpactVariant('')).toBe('default')
  })

  it('returns "default" for arbitrary strings', () => {
    expect(incidentImpactVariant('moderate')).toBe('default')
    expect(incidentImpactVariant('low')).toBe('default')
  })
})

// ---------------------------------------------------------------------------
// uptimeColor()
// ---------------------------------------------------------------------------
describe('uptimeColor', () => {
  it('returns "text-foreground-subtle" for null', () => {
    expect(uptimeColor(null)).toBe('text-foreground-subtle')
  })

  it('returns "text-success" for 100%', () => {
    expect(uptimeColor(100)).toBe('text-success')
  })

  it('returns "text-success" for exactly 99%', () => {
    expect(uptimeColor(99)).toBe('text-success')
  })

  it('returns "text-success" for 99.99%', () => {
    expect(uptimeColor(99.99)).toBe('text-success')
  })

  it('returns "text-warning" for 98.99% (below 99, above 95)', () => {
    expect(uptimeColor(98.99)).toBe('text-warning')
  })

  it('returns "text-warning" for exactly 95%', () => {
    expect(uptimeColor(95)).toBe('text-warning')
  })

  it('returns "text-warning" for 97%', () => {
    expect(uptimeColor(97)).toBe('text-warning')
  })

  it('returns "text-danger" for 94.99% (below 95)', () => {
    expect(uptimeColor(94.99)).toBe('text-danger')
  })

  it('returns "text-danger" for 0%', () => {
    expect(uptimeColor(0)).toBe('text-danger')
  })

  it('returns "text-danger" for 50%', () => {
    expect(uptimeColor(50)).toBe('text-danger')
  })

  it('returns "text-danger" for negative values', () => {
    // Edge case: negative percent should still fall through to danger
    expect(uptimeColor(-1)).toBe('text-danger')
  })
})

// ---------------------------------------------------------------------------
// timeAgo()
// ---------------------------------------------------------------------------
describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for a date less than 1 minute ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:00:30Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('just now')
  })

  it('returns "just now" for exactly now', () => {
    vi.useFakeTimers()
    const now = new Date('2025-06-15T12:00:00Z')
    vi.setSystemTime(now)
    expect(timeAgo(now)).toBe('just now')
  })

  it('returns minutes for 1-59 minutes ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:05:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('5m ago')
  })

  it('returns "1m ago" at exactly 60 seconds', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:01:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('1m ago')
  })

  it('returns "59m ago" at 59 minutes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:59:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('59m ago')
  })

  it('returns hours for 1-23 hours ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T15:00:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('3h ago')
  })

  it('returns "1h ago" at exactly 60 minutes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T13:00:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('1h ago')
  })

  it('returns "23h ago" at 23 hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-16T11:00:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('23h ago')
  })

  it('returns days for 1-29 days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-18T12:00:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('3d ago')
  })

  it('returns "1d ago" at exactly 24 hours', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-16T12:00:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('1d ago')
  })

  it('returns "29d ago" at 29 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-07-14T12:00:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('29d ago')
  })

  it('returns toLocaleDateString() for 30+ days ago', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-08-15T12:00:00Z'))
    const past = new Date('2025-06-15T12:00:00Z')
    const result = timeAgo(past)
    // Should be a locale-formatted date string, not "Xd ago"
    expect(result).not.toContain('d ago')
    expect(result).not.toContain('m ago')
    expect(result).not.toContain('h ago')
    // It should match the locale string produced by toLocaleDateString
    expect(result).toBe(past.toLocaleDateString())
  })

  it('returns toLocaleDateString() for exactly 30 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-07-15T12:00:00Z'))
    const past = new Date('2025-06-15T12:00:00Z')
    const result = timeAgo(past)
    expect(result).toBe(past.toLocaleDateString())
  })

  it('accepts an ISO date string', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T12:10:00Z'))
    expect(timeAgo('2025-06-15T12:00:00Z')).toBe('10m ago')
  })

  it('accepts a Date object', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T14:00:00Z'))
    expect(timeAgo(new Date('2025-06-15T12:00:00Z'))).toBe('2h ago')
  })
})
