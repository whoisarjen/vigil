import {
  PLANS,
  SCHEDULE_INTERVALS,
  HTTP_METHODS,
  TIMEOUT_OPTIONS,
  INCIDENT_STATUSES,
  INCIDENT_IMPACTS,
} from '~~/shared/types'

import type {
  Plan,
  MonitorStatus,
  HttpMethod,
  SessionUser,
  MonitorWithLatest,
  IncidentStatus,
  IncidentImpact,
} from '~~/shared/types'

// ---------------------------------------------------------------------------
// 1. PLANS constant
// ---------------------------------------------------------------------------
describe('PLANS', () => {
  it('contains free and pro plan keys', () => {
    expect(PLANS).toHaveProperty('free')
    expect(PLANS).toHaveProperty('pro')
    expect(Object.keys(PLANS)).toEqual(['free', 'pro'])
  })

  describe('free plan', () => {
    it('has name "Free"', () => {
      expect(PLANS.free.name).toBe('Free')
    })

    it('allows a maximum of 5 monitors', () => {
      expect(PLANS.free.maxMonitors).toBe(5)
    })

    it('retains 7 days of history', () => {
      expect(PLANS.free.historyDays).toBe(7)
    })

    it('has a maximum timeout of 15 000 ms', () => {
      expect(PLANS.free.maxTimeoutMs).toBe(15_000)
    })
  })

  describe('pro plan', () => {
    it('has name "Pro"', () => {
      expect(PLANS.pro.name).toBe('Pro')
    })

    it('allows a maximum of 50 monitors', () => {
      expect(PLANS.pro.maxMonitors).toBe(50)
    })

    it('retains 90 days of history', () => {
      expect(PLANS.pro.historyDays).toBe(90)
    })

    it('has a maximum timeout of 30 000 ms', () => {
      expect(PLANS.pro.maxTimeoutMs).toBe(30_000)
    })
  })

  it('pro plan limits are strictly greater than free plan limits', () => {
    expect(PLANS.pro.maxMonitors).toBeGreaterThan(PLANS.free.maxMonitors)
    expect(PLANS.pro.historyDays).toBeGreaterThan(PLANS.free.historyDays)
    expect(PLANS.pro.maxTimeoutMs).toBeGreaterThan(PLANS.free.maxTimeoutMs)
  })
})

// ---------------------------------------------------------------------------
// 2. SCHEDULE_INTERVALS
// ---------------------------------------------------------------------------
describe('SCHEDULE_INTERVALS', () => {
  const expectedValues = [15, 30, 60, 120, 360, 720, 1440]

  it('contains exactly the expected interval values', () => {
    const values = SCHEDULE_INTERVALS.map((i) => i.value)
    expect(values).toEqual(expectedValues)
  })

  it('has a label string for every entry', () => {
    for (const interval of SCHEDULE_INTERVALS) {
      expect(typeof interval.label).toBe('string')
      expect(interval.label.length).toBeGreaterThan(0)
    }
  })

  it('all values are numbers', () => {
    for (const interval of SCHEDULE_INTERVALS) {
      expect(typeof interval.value).toBe('number')
    }
  })

  it('values are sorted in ascending order', () => {
    const values = SCHEDULE_INTERVALS.map((i) => i.value)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('all values are positive integers', () => {
    for (const interval of SCHEDULE_INTERVALS) {
      expect(Number.isInteger(interval.value)).toBe(true)
      expect(interval.value).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// 3. HTTP_METHODS
// ---------------------------------------------------------------------------
describe('HTTP_METHODS', () => {
  it('contains GET, POST, PUT, PATCH, DELETE, HEAD', () => {
    expect(HTTP_METHODS).toContain('GET')
    expect(HTTP_METHODS).toContain('POST')
    expect(HTTP_METHODS).toContain('PUT')
    expect(HTTP_METHODS).toContain('PATCH')
    expect(HTTP_METHODS).toContain('DELETE')
    expect(HTTP_METHODS).toContain('HEAD')
  })

  it('contains exactly 6 methods', () => {
    expect(HTTP_METHODS).toHaveLength(6)
  })

  it('all entries are non-empty uppercase strings', () => {
    for (const method of HTTP_METHODS) {
      expect(typeof method).toBe('string')
      expect(method).toBe(method.toUpperCase())
      expect(method.length).toBeGreaterThan(0)
    }
  })

  it('contains no duplicates', () => {
    const unique = new Set(HTTP_METHODS)
    expect(unique.size).toBe(HTTP_METHODS.length)
  })
})

// ---------------------------------------------------------------------------
// 4. TIMEOUT_OPTIONS
// ---------------------------------------------------------------------------
describe('TIMEOUT_OPTIONS', () => {
  const expectedValues = [1000, 2000, 3000, 5000, 10000, 15000]

  it('contains the expected timeout values', () => {
    const values = TIMEOUT_OPTIONS.map((o) => o.value)
    expect(values).toEqual(expectedValues)
  })

  it('all values are numbers', () => {
    for (const option of TIMEOUT_OPTIONS) {
      expect(typeof option.value).toBe('number')
    }
  })

  it('all values are within reasonable range (1 000 - 15 000 ms)', () => {
    for (const option of TIMEOUT_OPTIONS) {
      expect(option.value).toBeGreaterThanOrEqual(1000)
      expect(option.value).toBeLessThanOrEqual(15000)
    }
  })

  it('has a label string for every entry', () => {
    for (const option of TIMEOUT_OPTIONS) {
      expect(typeof option.label).toBe('string')
      expect(option.label.length).toBeGreaterThan(0)
    }
  })

  it('values are sorted in ascending order', () => {
    const values = TIMEOUT_OPTIONS.map((o) => o.value)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })
})

// ---------------------------------------------------------------------------
// 5. INCIDENT_STATUSES
// ---------------------------------------------------------------------------
describe('INCIDENT_STATUSES', () => {
  const expectedStatuses = ['investigating', 'identified', 'monitoring', 'resolved']

  it('contains investigating, identified, monitoring, resolved', () => {
    const values = INCIDENT_STATUSES.map((s) => s.value)
    expect(values).toEqual(expectedStatuses)
  })

  it('each entry has a non-empty label property', () => {
    for (const status of INCIDENT_STATUSES) {
      expect(status).toHaveProperty('label')
      expect(typeof status.label).toBe('string')
      expect(status.label.length).toBeGreaterThan(0)
    }
  })

  it('each entry has a value property', () => {
    for (const status of INCIDENT_STATUSES) {
      expect(status).toHaveProperty('value')
    }
  })

  it('contains no duplicate values', () => {
    const values = INCIDENT_STATUSES.map((s) => s.value)
    expect(new Set(values).size).toBe(values.length)
  })
})

// ---------------------------------------------------------------------------
// 6. INCIDENT_IMPACTS
// ---------------------------------------------------------------------------
describe('INCIDENT_IMPACTS', () => {
  const expectedImpacts = ['none', 'minor', 'major', 'critical']

  it('contains none, minor, major, critical', () => {
    const values = INCIDENT_IMPACTS.map((i) => i.value)
    expect(values).toEqual(expectedImpacts)
  })

  it('each entry has a non-empty label property', () => {
    for (const impact of INCIDENT_IMPACTS) {
      expect(impact).toHaveProperty('label')
      expect(typeof impact.label).toBe('string')
      expect(impact.label.length).toBeGreaterThan(0)
    }
  })

  it('each entry has a value property', () => {
    for (const impact of INCIDENT_IMPACTS) {
      expect(impact).toHaveProperty('value')
    }
  })

  it('contains no duplicate values', () => {
    const values = INCIDENT_IMPACTS.map((i) => i.value)
    expect(new Set(values).size).toBe(values.length)
  })
})

// ---------------------------------------------------------------------------
// 7. Type safety -- create objects that satisfy each interface / type alias
// ---------------------------------------------------------------------------
describe('type safety', () => {
  describe('Plan type', () => {
    it('accepts "free" as a valid plan', () => {
      const plan: Plan = 'free'
      expect(plan).toBe('free')
    })

    it('accepts "pro" as a valid plan', () => {
      const plan: Plan = 'pro'
      expect(plan).toBe('pro')
    })
  })

  describe('MonitorStatus type', () => {
    it('accepts all four monitor statuses', () => {
      const statuses: MonitorStatus[] = ['success', 'failure', 'timeout', 'error']
      expect(statuses).toHaveLength(4)
      expect(statuses).toContain('success')
      expect(statuses).toContain('failure')
      expect(statuses).toContain('timeout')
      expect(statuses).toContain('error')
    })
  })

  describe('HttpMethod type', () => {
    it('accepts all six HTTP methods', () => {
      const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']
      expect(methods).toHaveLength(6)
    })
  })

  describe('IncidentStatus type', () => {
    it('accepts all four incident statuses', () => {
      const statuses: IncidentStatus[] = ['investigating', 'identified', 'monitoring', 'resolved']
      expect(statuses).toHaveLength(4)
    })
  })

  describe('IncidentImpact type', () => {
    it('accepts all four incident impacts', () => {
      const impacts: IncidentImpact[] = ['none', 'minor', 'major', 'critical']
      expect(impacts).toHaveLength(4)
    })
  })

  describe('SessionUser interface', () => {
    it('can create a valid SessionUser object with all required fields', () => {
      const user: SessionUser = {
        id: 'usr_123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.png',
        plan: 'free',
      }

      expect(user.id).toBe('usr_123')
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
      expect(user.image).toBe('https://example.com/avatar.png')
      expect(user.plan).toBe('free')
    })

    it('allows null for name and image', () => {
      const user: SessionUser = {
        id: 'usr_456',
        email: 'minimal@example.com',
        name: null,
        image: null,
        plan: 'pro',
      }

      expect(user.name).toBeNull()
      expect(user.image).toBeNull()
    })
  })

  describe('MonitorWithLatest interface', () => {
    it('can create a fully-populated MonitorWithLatest object', () => {
      const monitor: MonitorWithLatest = {
        id: 'mon_abc',
        name: 'API Health',
        url: 'https://api.example.com/health',
        method: 'GET',
        expectedStatus: 200,
        timeoutMs: 5000,
        scheduleInterval: 60,
        enabled: true,
        createdAt: '2025-01-01T00:00:00Z',
        latestStatus: 'success',
        latestResponseTime: 142,
        latestCheckedAt: '2025-06-01T12:00:00Z',
        uptimePercent: 99.95,
      }

      expect(monitor.id).toBe('mon_abc')
      expect(monitor.name).toBe('API Health')
      expect(monitor.url).toBe('https://api.example.com/health')
      expect(monitor.method).toBe('GET')
      expect(monitor.expectedStatus).toBe(200)
      expect(monitor.timeoutMs).toBe(5000)
      expect(monitor.scheduleInterval).toBe(60)
      expect(monitor.enabled).toBe(true)
      expect(monitor.createdAt).toBe('2025-01-01T00:00:00Z')
      expect(monitor.latestStatus).toBe('success')
      expect(monitor.latestResponseTime).toBe(142)
      expect(monitor.latestCheckedAt).toBe('2025-06-01T12:00:00Z')
      expect(monitor.uptimePercent).toBe(99.95)
    })

    it('allows null for latestStatus, latestResponseTime, latestCheckedAt, and uptimePercent', () => {
      const monitor: MonitorWithLatest = {
        id: 'mon_new',
        name: 'New Monitor',
        url: 'https://example.com',
        method: 'HEAD',
        expectedStatus: 200,
        timeoutMs: 3000,
        scheduleInterval: 15,
        enabled: false,
        createdAt: '2025-06-01T00:00:00Z',
        latestStatus: null,
        latestResponseTime: null,
        latestCheckedAt: null,
        uptimePercent: null,
      }

      expect(monitor.latestStatus).toBeNull()
      expect(monitor.latestResponseTime).toBeNull()
      expect(monitor.latestCheckedAt).toBeNull()
      expect(monitor.uptimePercent).toBeNull()
    })

    it('accepts every valid HttpMethod', () => {
      for (const method of HTTP_METHODS) {
        const monitor: MonitorWithLatest = {
          id: `mon_${method}`,
          name: `${method} monitor`,
          url: 'https://example.com',
          method,
          expectedStatus: 200,
          timeoutMs: 5000,
          scheduleInterval: 60,
          enabled: true,
          createdAt: '2025-01-01T00:00:00Z',
          latestStatus: null,
          latestResponseTime: null,
          latestCheckedAt: null,
          uptimePercent: null,
        }
        expect(monitor.method).toBe(method)
      }
    })
  })
})
