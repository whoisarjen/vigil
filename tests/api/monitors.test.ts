import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'
import {
  createMonitorSchema,
  updateMonitorSchema,
} from '../../server/utils/validations'
import { PLANS, SCHEDULE_INTERVALS, HTTP_METHODS } from '../../shared/types'

// =============================================================================
// Helper: build a valid monitor payload for reuse across tests
// =============================================================================

function validMonitorPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'My API Monitor',
    url: 'https://api.example.com/health',
    method: 'GET' as const,
    expectedStatus: 200,
    timeoutMs: 5000,
    scheduleInterval: 15,
    headers: { Authorization: 'Bearer token' },
    body: null,
    enabled: true,
    ...overrides,
  }
}

// =============================================================================
// 1. createMonitorSchema -- unit tests
// =============================================================================

describe('createMonitorSchema', () => {
  // ---------------------------------------------------------------------------
  // Happy-path: full payload
  // ---------------------------------------------------------------------------
  it('accepts a fully valid payload', () => {
    const payload = validMonitorPayload()
    const result = createMonitorSchema.parse(payload)

    expect(result.name).toBe('My API Monitor')
    expect(result.url).toBe('https://api.example.com/health')
    expect(result.method).toBe('GET')
    expect(result.expectedStatus).toBe(200)
    expect(result.timeoutMs).toBe(5000)
    expect(result.scheduleInterval).toBe(15)
    expect(result.headers).toEqual({ Authorization: 'Bearer token' })
    expect(result.body).toBeNull()
    expect(result.enabled).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // Defaults are applied when optional fields are omitted
  // ---------------------------------------------------------------------------
  it('applies default values when optional fields are omitted', () => {
    const result = createMonitorSchema.parse({
      name: 'Minimal Monitor',
      url: 'https://example.com',
      scheduleInterval: 60,
    })

    expect(result.method).toBe('GET')
    expect(result.expectedStatus).toBe(200)
    expect(result.timeoutMs).toBe(5000)
    expect(result.headers).toEqual({})
    expect(result.enabled).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // name field
  // ---------------------------------------------------------------------------
  describe('name', () => {
    it('rejects an empty string', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ name: '' })),
      ).toThrow(ZodError)
    })

    it('rejects a name longer than 100 characters', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ name: 'a'.repeat(101) })),
      ).toThrow(ZodError)
    })

    it('accepts a name of exactly 100 characters', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ name: 'a'.repeat(100) }),
      )
      expect(result.name).toHaveLength(100)
    })

    it('accepts a name of exactly 1 character', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ name: 'X' }),
      )
      expect(result.name).toBe('X')
    })

    it('rejects missing name', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).name
      expect(() => createMonitorSchema.parse(payload)).toThrow(ZodError)
    })

    it('rejects a non-string name', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ name: 123 })),
      ).toThrow(ZodError)
    })
  })

  // ---------------------------------------------------------------------------
  // url field
  // ---------------------------------------------------------------------------
  describe('url', () => {
    it('accepts a valid HTTPS URL', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ url: 'https://example.com/status' }),
      )
      expect(result.url).toBe('https://example.com/status')
    })

    it('accepts a valid HTTP URL', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ url: 'http://example.com' }),
      )
      expect(result.url).toBe('http://example.com')
    })

    it('rejects a plain string that is not a URL', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ url: 'not-a-url' })),
      ).toThrow(ZodError)
    })

    it('rejects an empty string', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ url: '' })),
      ).toThrow(ZodError)
    })

    it('rejects a missing url', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).url
      expect(() => createMonitorSchema.parse(payload)).toThrow(ZodError)
    })

    it('rejects a URL without a protocol', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ url: 'example.com' })),
      ).toThrow(ZodError)
    })
  })

  // ---------------------------------------------------------------------------
  // method field
  // ---------------------------------------------------------------------------
  describe('method', () => {
    it.each(HTTP_METHODS)('accepts valid HTTP method: %s', (method) => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ method }),
      )
      expect(result.method).toBe(method)
    })

    it('defaults to GET when not provided', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).method
      const result = createMonitorSchema.parse(payload)
      expect(result.method).toBe('GET')
    })

    it('rejects an invalid HTTP method', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ method: 'OPTIONS' })),
      ).toThrow(ZodError)
    })

    it('rejects a lowercase method', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ method: 'get' })),
      ).toThrow(ZodError)
    })
  })

  // ---------------------------------------------------------------------------
  // expectedStatus field
  // ---------------------------------------------------------------------------
  describe('expectedStatus', () => {
    it('defaults to 200 when not provided', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).expectedStatus
      const result = createMonitorSchema.parse(payload)
      expect(result.expectedStatus).toBe(200)
    })

    it('coerces a string to a number', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ expectedStatus: '404' }),
      )
      expect(result.expectedStatus).toBe(404)
    })

    it('accepts the minimum valid status code (100)', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ expectedStatus: 100 }),
      )
      expect(result.expectedStatus).toBe(100)
    })

    it('accepts the maximum valid status code (599)', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ expectedStatus: 599 }),
      )
      expect(result.expectedStatus).toBe(599)
    })

    it('rejects a status code below 100', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ expectedStatus: 99 })),
      ).toThrow(ZodError)
    })

    it('rejects a status code above 599', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ expectedStatus: 600 })),
      ).toThrow(ZodError)
    })

    it('rejects a non-integer status code', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ expectedStatus: 200.5 })),
      ).toThrow(ZodError)
    })
  })

  // ---------------------------------------------------------------------------
  // timeoutMs field
  // ---------------------------------------------------------------------------
  describe('timeoutMs', () => {
    it('defaults to 5000 when not provided', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).timeoutMs
      const result = createMonitorSchema.parse(payload)
      expect(result.timeoutMs).toBe(5000)
    })

    it('coerces a string to a number', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ timeoutMs: '3000' }),
      )
      expect(result.timeoutMs).toBe(3000)
    })

    it('accepts the minimum value (1000)', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ timeoutMs: 1000 }),
      )
      expect(result.timeoutMs).toBe(1000)
    })

    it('accepts the maximum value (15000)', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ timeoutMs: 15000 }),
      )
      expect(result.timeoutMs).toBe(15000)
    })

    it('rejects a value below 1000', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ timeoutMs: 999 })),
      ).toThrow(ZodError)
    })

    it('rejects a value above 15000', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ timeoutMs: 15001 })),
      ).toThrow(ZodError)
    })

    it('rejects a non-integer value', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ timeoutMs: 5000.5 })),
      ).toThrow(ZodError)
    })
  })

  // ---------------------------------------------------------------------------
  // scheduleInterval field
  // ---------------------------------------------------------------------------
  describe('scheduleInterval', () => {
    const validIntervals = SCHEDULE_INTERVALS.map(s => s.value)

    it.each(validIntervals)(
      'accepts valid schedule interval: %i minutes',
      (interval) => {
        const result = createMonitorSchema.parse(
          validMonitorPayload({ scheduleInterval: interval }),
        )
        expect(result.scheduleInterval).toBe(interval)
      },
    )

    it('rejects an interval not in the allowed list', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ scheduleInterval: 10 })),
      ).toThrow(ZodError)
    })

    it('rejects zero', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ scheduleInterval: 0 })),
      ).toThrow(ZodError)
    })

    it('rejects a negative interval', () => {
      expect(() =>
        createMonitorSchema.parse(validMonitorPayload({ scheduleInterval: -15 })),
      ).toThrow(ZodError)
    })

    it('coerces a string to a number before validating', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ scheduleInterval: '30' }),
      )
      expect(result.scheduleInterval).toBe(30)
    })

    it('rejects a missing scheduleInterval (no default)', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).scheduleInterval
      expect(() => createMonitorSchema.parse(payload)).toThrow(ZodError)
    })
  })

  // ---------------------------------------------------------------------------
  // headers field
  // ---------------------------------------------------------------------------
  describe('headers', () => {
    it('defaults to an empty object when not provided', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).headers
      const result = createMonitorSchema.parse(payload)
      expect(result.headers).toEqual({})
    })

    it('accepts a valid headers object', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({
          headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'abc123' },
        }),
      )
      expect(result.headers).toEqual({
        'Content-Type': 'application/json',
        'X-Api-Key': 'abc123',
      })
    })

    it('rejects headers with non-string values', () => {
      expect(() =>
        createMonitorSchema.parse(
          validMonitorPayload({ headers: { key: 123 } }),
        ),
      ).toThrow(ZodError)
    })
  })

  // ---------------------------------------------------------------------------
  // body field
  // ---------------------------------------------------------------------------
  describe('body', () => {
    it('accepts a JSON string body', () => {
      const bodyStr = JSON.stringify({ key: 'value' })
      const result = createMonitorSchema.parse(
        validMonitorPayload({ body: bodyStr }),
      )
      expect(result.body).toBe(bodyStr)
    })

    it('accepts null', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ body: null }),
      )
      expect(result.body).toBeNull()
    })

    it('accepts undefined (optional)', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).body
      const result = createMonitorSchema.parse(payload)
      // body should be undefined or null when not supplied
      expect(result.body === undefined || result.body === null).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // enabled field
  // ---------------------------------------------------------------------------
  describe('enabled', () => {
    it('defaults to true when not provided', () => {
      const payload = validMonitorPayload()
      delete (payload as Record<string, unknown>).enabled
      const result = createMonitorSchema.parse(payload)
      expect(result.enabled).toBe(true)
    })

    it('accepts false explicitly', () => {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ enabled: false }),
      )
      expect(result.enabled).toBe(false)
    })

    it('coerces truthy/falsy values', () => {
      const resultTrue = createMonitorSchema.parse(
        validMonitorPayload({ enabled: 'true' }),
      )
      expect(resultTrue.enabled).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Completely invalid inputs
  // ---------------------------------------------------------------------------
  describe('rejects entirely invalid inputs', () => {
    it('rejects null', () => {
      expect(() => createMonitorSchema.parse(null)).toThrow()
    })

    it('rejects undefined', () => {
      expect(() => createMonitorSchema.parse(undefined)).toThrow()
    })

    it('rejects a string', () => {
      expect(() => createMonitorSchema.parse('invalid')).toThrow()
    })

    it('rejects a number', () => {
      expect(() => createMonitorSchema.parse(42)).toThrow()
    })

    it('rejects an empty object (missing required fields)', () => {
      expect(() => createMonitorSchema.parse({})).toThrow(ZodError)
    })
  })
})

// =============================================================================
// 2. updateMonitorSchema -- unit tests
// =============================================================================

describe('updateMonitorSchema', () => {
  it('is a partial schema -- all fields are optional', () => {
    const result = updateMonitorSchema.parse({})
    // Should succeed and result should be an (empty-ish) object
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('accepts a partial update with only name', () => {
    const result = updateMonitorSchema.parse({ name: 'Updated Name' })
    expect(result.name).toBe('Updated Name')
  })

  it('accepts a partial update with only url', () => {
    const result = updateMonitorSchema.parse({
      url: 'https://new-url.example.com',
    })
    expect(result.url).toBe('https://new-url.example.com')
  })

  it('accepts a partial update with only enabled', () => {
    const result = updateMonitorSchema.parse({ enabled: false })
    expect(result.enabled).toBe(false)
  })

  it('accepts multiple fields at once', () => {
    const result = updateMonitorSchema.parse({
      name: 'New Name',
      method: 'POST',
      timeoutMs: 10000,
    })
    expect(result.name).toBe('New Name')
    expect(result.method).toBe('POST')
    expect(result.timeoutMs).toBe(10000)
  })

  it('still validates field constraints -- rejects invalid URL', () => {
    expect(() =>
      updateMonitorSchema.parse({ url: 'not-a-url' }),
    ).toThrow(ZodError)
  })

  it('still validates field constraints -- rejects empty name', () => {
    expect(() =>
      updateMonitorSchema.parse({ name: '' }),
    ).toThrow(ZodError)
  })

  it('still validates field constraints -- rejects invalid method', () => {
    expect(() =>
      updateMonitorSchema.parse({ method: 'INVALID' }),
    ).toThrow(ZodError)
  })

  it('still validates field constraints -- rejects out-of-range expectedStatus', () => {
    expect(() =>
      updateMonitorSchema.parse({ expectedStatus: 999 }),
    ).toThrow(ZodError)
  })

  it('still validates field constraints -- rejects invalid scheduleInterval', () => {
    expect(() =>
      updateMonitorSchema.parse({ scheduleInterval: 45 }),
    ).toThrow(ZodError)
  })

  it('still validates field constraints -- rejects timeoutMs below minimum', () => {
    expect(() =>
      updateMonitorSchema.parse({ timeoutMs: 500 }),
    ).toThrow(ZodError)
  })

  it('ignores unknown fields (strip by default)', () => {
    const result = updateMonitorSchema.parse({
      name: 'Valid',
      unknownField: 'should be stripped',
    })
    expect(result.name).toBe('Valid')
    expect((result as Record<string, unknown>).unknownField).toBeUndefined()
  })
})

// =============================================================================
// 3. PLANS configuration -- sanity checks
// =============================================================================

describe('PLANS configuration', () => {
  it('has a free plan with correct limits', () => {
    expect(PLANS.free).toBeDefined()
    expect(PLANS.free.maxMonitors).toBe(5)
    expect(PLANS.free.historyDays).toBe(7)
    expect(PLANS.free.maxTimeoutMs).toBe(15_000)
  })

  it('has a pro plan with higher limits', () => {
    expect(PLANS.pro).toBeDefined()
    expect(PLANS.pro.maxMonitors).toBe(50)
    expect(PLANS.pro.historyDays).toBe(90)
    expect(PLANS.pro.maxTimeoutMs).toBe(30_000)
  })

  it('pro plan allows more monitors than free plan', () => {
    expect(PLANS.pro.maxMonitors).toBeGreaterThan(PLANS.free.maxMonitors)
  })
})

// =============================================================================
// 4. SCHEDULE_INTERVALS -- consistency with schema validation
// =============================================================================

describe('SCHEDULE_INTERVALS consistency', () => {
  const allowedBySchema = [15, 30, 60, 120, 360, 720, 1440]

  it('SCHEDULE_INTERVALS values match the schema refine list', () => {
    const intervalValues = SCHEDULE_INTERVALS.map(s => s.value)
    expect(intervalValues).toEqual(allowedBySchema)
  })

  it('every SCHEDULE_INTERVALS value is accepted by createMonitorSchema', () => {
    for (const { value } of SCHEDULE_INTERVALS) {
      const result = createMonitorSchema.parse(
        validMonitorPayload({ scheduleInterval: value }),
      )
      expect(result.scheduleInterval).toBe(value)
    }
  })
})

// =============================================================================
// 5. Error message quality
// =============================================================================

describe('Zod error messages', () => {
  it('returns a descriptive error for missing name', () => {
    try {
      createMonitorSchema.parse(validMonitorPayload({ name: '' }))
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError)
      const zodErr = err as ZodError
      const nameIssue = zodErr.issues.find(
        (i) => Array.isArray(i.path) && i.path.includes('name'),
      )
      expect(nameIssue).toBeDefined()
    }
  })

  it('returns a descriptive error for invalid URL', () => {
    try {
      createMonitorSchema.parse(validMonitorPayload({ url: 'bad' }))
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError)
      const zodErr = err as ZodError
      const urlIssue = zodErr.issues.find(
        (i) => Array.isArray(i.path) && i.path.includes('url'),
      )
      expect(urlIssue).toBeDefined()
    }
  })

  it('returns a descriptive error for invalid scheduleInterval', () => {
    try {
      createMonitorSchema.parse(validMonitorPayload({ scheduleInterval: 999 }))
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError)
      const zodErr = err as ZodError
      const intervalIssue = zodErr.issues.find(
        (i) => Array.isArray(i.path) && i.path.includes('scheduleInterval'),
      )
      expect(intervalIssue).toBeDefined()
    }
  })

  it('collects multiple errors at once', () => {
    const result = createMonitorSchema.safeParse({
      name: '',
      url: 'bad',
      scheduleInterval: 999,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      // Should have errors for name, url, and scheduleInterval at minimum
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3)
    }
  })
})

// =============================================================================
// 6. Edge-case combinations
// =============================================================================

describe('edge-case combinations', () => {
  it('accepts a monitor with POST method and a body', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({
        method: 'POST',
        body: '{"key":"value"}',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(result.method).toBe('POST')
    expect(result.body).toBe('{"key":"value"}')
  })

  it('accepts a monitor with DELETE method and no body', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({ method: 'DELETE', body: null }),
    )
    expect(result.method).toBe('DELETE')
    expect(result.body).toBeNull()
  })

  it('accepts a monitor with HEAD method', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({ method: 'HEAD' }),
    )
    expect(result.method).toBe('HEAD')
  })

  it('accepts a monitor with PATCH method', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({ method: 'PATCH', body: '{"update":true}' }),
    )
    expect(result.method).toBe('PATCH')
  })

  it('accepts a URL with query parameters', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({ url: 'https://api.example.com/health?region=us-east' }),
    )
    expect(result.url).toContain('?region=us-east')
  })

  it('accepts a URL with a port number', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({ url: 'https://api.example.com:8443/health' }),
    )
    expect(result.url).toContain(':8443')
  })

  it('accepts empty headers object', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({ headers: {} }),
    )
    expect(result.headers).toEqual({})
  })

  it('accepts the maximum timeout with the longest interval', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({ timeoutMs: 15000, scheduleInterval: 1440 }),
    )
    expect(result.timeoutMs).toBe(15000)
    expect(result.scheduleInterval).toBe(1440)
  })

  it('accepts the minimum timeout with the shortest interval', () => {
    const result = createMonitorSchema.parse(
      validMonitorPayload({ timeoutMs: 1000, scheduleInterval: 15 }),
    )
    expect(result.timeoutMs).toBe(1000)
    expect(result.scheduleInterval).toBe(15)
  })
})

// =============================================================================
// 7. Integration test descriptions (e2e -- requires running Nuxt server)
//
// These tests document what should be tested with a running server using
// $fetch from @nuxt/test-utils/e2e. They cannot run without a database
// and authenticated session, so they are described as comments.
// =============================================================================

/*
 * =========================================================================
 * INTEGRATION TESTS -- to be run with a live Nuxt server + database
 * =========================================================================
 *
 * Setup:
 *   import { setup, $fetch } from '@nuxt/test-utils/e2e'
 *   beforeAll(async () => { await setup({ /* nuxt config * / }) })
 *   -- Create a test user session (seed the database + set session cookie)
 *   -- Create helper functions to authenticate requests
 *
 * -------------------------------------------------------------------------
 * GET /api/monitors
 * -------------------------------------------------------------------------
 *
 * it('returns 401 when no auth session is present', async () => {
 *   const res = await $fetch('/api/monitors', { ignoreResponseError: true })
 *   expect(res.statusCode).toBe(401)
 * })
 *
 * it('returns an empty array for a new user with no monitors', async () => {
 *   const monitors = await $fetch('/api/monitors', { headers: authHeaders })
 *   expect(monitors).toEqual([])
 * })
 *
 * it('returns monitors belonging to the authenticated user only', async () => {
 *   // Seed: create monitors for user A and user B
 *   const monitors = await $fetch('/api/monitors', { headers: userAHeaders })
 *   expect(monitors.every(m => m.userId === userA.id)).toBe(true)
 * })
 *
 * it('includes latestStatus, latestResponseTime, uptimePercent per monitor', async () => {
 *   const monitors = await $fetch('/api/monitors', { headers: authHeaders })
 *   for (const m of monitors) {
 *     expect(m).toHaveProperty('latestStatus')
 *     expect(m).toHaveProperty('latestResponseTime')
 *     expect(m).toHaveProperty('uptimePercent')
 *   }
 * })
 *
 * it('orders monitors by createdAt descending', async () => {
 *   const monitors = await $fetch('/api/monitors', { headers: authHeaders })
 *   for (let i = 1; i < monitors.length; i++) {
 *     expect(new Date(monitors[i-1].createdAt).getTime())
 *       .toBeGreaterThanOrEqual(new Date(monitors[i].createdAt).getTime())
 *   }
 * })
 *
 * -------------------------------------------------------------------------
 * POST /api/monitors
 * -------------------------------------------------------------------------
 *
 * it('returns 401 when no auth session is present', async () => {
 *   const res = await $fetch('/api/monitors', {
 *     method: 'POST',
 *     body: validPayload,
 *     ignoreResponseError: true,
 *   })
 *   expect(res.statusCode).toBe(401)
 * })
 *
 * it('creates a monitor and returns it with an id', async () => {
 *   const monitor = await $fetch('/api/monitors', {
 *     method: 'POST',
 *     body: validPayload,
 *     headers: authHeaders,
 *   })
 *   expect(monitor.id).toBeDefined()
 *   expect(monitor.name).toBe(validPayload.name)
 *   expect(monitor.url).toBe(validPayload.url)
 * })
 *
 * it('rejects creation with an invalid URL (400 from Zod)', async () => {
 *   await expect($fetch('/api/monitors', {
 *     method: 'POST',
 *     body: { ...validPayload, url: 'not-a-url' },
 *     headers: authHeaders,
 *   })).rejects.toMatchObject({ statusCode: 400 })
 * })
 *
 * it('rejects creation with missing name', async () => {
 *   const { name, ...noName } = validPayload
 *   await expect($fetch('/api/monitors', {
 *     method: 'POST',
 *     body: noName,
 *     headers: authHeaders,
 *   })).rejects.toMatchObject({ statusCode: 400 })
 * })
 *
 * it('rejects creation with invalid HTTP method', async () => {
 *   await expect($fetch('/api/monitors', {
 *     method: 'POST',
 *     body: { ...validPayload, method: 'TRACE' },
 *     headers: authHeaders,
 *   })).rejects.toMatchObject({ statusCode: 400 })
 * })
 *
 * it('enforces free plan monitor limit (5)', async () => {
 *   // Seed: create 5 monitors for the user
 *   await expect($fetch('/api/monitors', {
 *     method: 'POST',
 *     body: validPayload,
 *     headers: authHeaders,
 *   })).rejects.toMatchObject({ statusCode: 403 })
 * })
 *
 * it('allows pro plan users to create more than 5 monitors', async () => {
 *   // Seed: user with plan='pro' and 5 existing monitors
 *   const monitor = await $fetch('/api/monitors', {
 *     method: 'POST',
 *     body: validPayload,
 *     headers: proUserHeaders,
 *   })
 *   expect(monitor.id).toBeDefined()
 * })
 *
 * -------------------------------------------------------------------------
 * GET /api/monitors/:id
 * -------------------------------------------------------------------------
 *
 * it('returns 401 when no auth session is present', async () => {
 *   const res = await $fetch(`/api/monitors/${monitorId}`, {
 *     ignoreResponseError: true,
 *   })
 *   expect(res.statusCode).toBe(401)
 * })
 *
 * it('returns the monitor with results and stats', async () => {
 *   const data = await $fetch(`/api/monitors/${monitorId}`, {
 *     headers: authHeaders,
 *   })
 *   expect(data.id).toBe(monitorId)
 *   expect(data.results).toBeInstanceOf(Array)
 *   expect(data.stats).toHaveProperty('uptimePercent')
 *   expect(data.stats).toHaveProperty('avgResponseTime')
 *   expect(data.stats).toHaveProperty('totalChecks')
 *   expect(data.stats).toHaveProperty('lastChecked')
 * })
 *
 * it('returns 404 for a non-existent monitor id', async () => {
 *   await expect(
 *     $fetch('/api/monitors/non-existent-id', { headers: authHeaders }),
 *   ).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('returns 404 when trying to access another user\'s monitor', async () => {
 *   // monitorId belongs to user A; request as user B
 *   await expect(
 *     $fetch(`/api/monitors/${userAMonitorId}`, { headers: userBHeaders }),
 *   ).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('limits results to last 7 days and max 500', async () => {
 *   const data = await $fetch(`/api/monitors/${monitorId}`, {
 *     headers: authHeaders,
 *   })
 *   expect(data.results.length).toBeLessThanOrEqual(500)
 *   if (data.results.length > 0) {
 *     const oldest = new Date(data.results[data.results.length - 1].executedAt)
 *     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
 *     expect(oldest.getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime())
 *   }
 * })
 *
 * it('calculates uptimePercent as null when there are no results', async () => {
 *   // Create a fresh monitor with no results
 *   const data = await $fetch(`/api/monitors/${freshMonitorId}`, {
 *     headers: authHeaders,
 *   })
 *   expect(data.stats.uptimePercent).toBeNull()
 *   expect(data.stats.avgResponseTime).toBeNull()
 * })
 *
 * -------------------------------------------------------------------------
 * PUT /api/monitors/:id
 * -------------------------------------------------------------------------
 *
 * it('returns 401 when no auth session is present', async () => {
 *   await expect($fetch(`/api/monitors/${monitorId}`, {
 *     method: 'PUT',
 *     body: { name: 'Updated' },
 *     ignoreResponseError: true,
 *   })).rejects.toMatchObject({ statusCode: 401 })
 * })
 *
 * it('updates a monitor name', async () => {
 *   const updated = await $fetch(`/api/monitors/${monitorId}`, {
 *     method: 'PUT',
 *     body: { name: 'Updated Name' },
 *     headers: authHeaders,
 *   })
 *   expect(updated.name).toBe('Updated Name')
 * })
 *
 * it('updates multiple fields at once', async () => {
 *   const updated = await $fetch(`/api/monitors/${monitorId}`, {
 *     method: 'PUT',
 *     body: { name: 'New', method: 'POST', timeoutMs: 10000 },
 *     headers: authHeaders,
 *   })
 *   expect(updated.name).toBe('New')
 *   expect(updated.method).toBe('POST')
 *   expect(updated.timeoutMs).toBe(10000)
 * })
 *
 * it('sets updatedAt to a new timestamp', async () => {
 *   const before = new Date()
 *   const updated = await $fetch(`/api/monitors/${monitorId}`, {
 *     method: 'PUT',
 *     body: { name: 'Timestamp Test' },
 *     headers: authHeaders,
 *   })
 *   expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(before.getTime())
 * })
 *
 * it('returns 404 for a non-existent monitor id', async () => {
 *   await expect($fetch('/api/monitors/non-existent', {
 *     method: 'PUT',
 *     body: { name: 'X' },
 *     headers: authHeaders,
 *   })).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('returns 404 when updating another user\'s monitor', async () => {
 *   await expect($fetch(`/api/monitors/${userAMonitorId}`, {
 *     method: 'PUT',
 *     body: { name: 'Hacked' },
 *     headers: userBHeaders,
 *   })).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('validates input -- rejects invalid URL on update', async () => {
 *   await expect($fetch(`/api/monitors/${monitorId}`, {
 *     method: 'PUT',
 *     body: { url: 'not-a-url' },
 *     headers: authHeaders,
 *   })).rejects.toMatchObject({ statusCode: 400 })
 * })
 *
 * -------------------------------------------------------------------------
 * DELETE /api/monitors/:id
 * -------------------------------------------------------------------------
 *
 * it('returns 401 when no auth session is present', async () => {
 *   await expect($fetch(`/api/monitors/${monitorId}`, {
 *     method: 'DELETE',
 *     ignoreResponseError: true,
 *   })).rejects.toMatchObject({ statusCode: 401 })
 * })
 *
 * it('deletes a monitor and returns { success: true }', async () => {
 *   const result = await $fetch(`/api/monitors/${monitorId}`, {
 *     method: 'DELETE',
 *     headers: authHeaders,
 *   })
 *   expect(result).toEqual({ success: true })
 *   // Verify it is gone
 *   await expect($fetch(`/api/monitors/${monitorId}`, {
 *     headers: authHeaders,
 *   })).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('returns 404 for a non-existent monitor id', async () => {
 *   await expect($fetch('/api/monitors/non-existent', {
 *     method: 'DELETE',
 *     headers: authHeaders,
 *   })).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('returns 404 when deleting another user\'s monitor', async () => {
 *   await expect($fetch(`/api/monitors/${userAMonitorId}`, {
 *     method: 'DELETE',
 *     headers: userBHeaders,
 *   })).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('cascades deletion to associated monitor results', async () => {
 *   // After deleting the monitor, its results should also be gone
 *   const results = await db.select().from(monitorResults)
 *     .where(eq(monitorResults.monitorId, deletedMonitorId))
 *   expect(results).toHaveLength(0)
 * })
 *
 * -------------------------------------------------------------------------
 * GET /api/monitors/:id/results
 * -------------------------------------------------------------------------
 *
 * it('returns 401 when no auth session is present', async () => {
 *   await expect($fetch(`/api/monitors/${monitorId}/results`, {
 *     ignoreResponseError: true,
 *   })).rejects.toMatchObject({ statusCode: 401 })
 * })
 *
 * it('returns paginated results with default limit of 50', async () => {
 *   const results = await $fetch(`/api/monitors/${monitorId}/results`, {
 *     headers: authHeaders,
 *   })
 *   expect(results).toBeInstanceOf(Array)
 *   expect(results.length).toBeLessThanOrEqual(50)
 * })
 *
 * it('respects custom limit parameter', async () => {
 *   const results = await $fetch(`/api/monitors/${monitorId}/results?limit=10`, {
 *     headers: authHeaders,
 *   })
 *   expect(results.length).toBeLessThanOrEqual(10)
 * })
 *
 * it('caps limit at 200', async () => {
 *   const results = await $fetch(`/api/monitors/${monitorId}/results?limit=500`, {
 *     headers: authHeaders,
 *   })
 *   expect(results.length).toBeLessThanOrEqual(200)
 * })
 *
 * it('supports offset for pagination', async () => {
 *   const page1 = await $fetch(`/api/monitors/${monitorId}/results?limit=5&offset=0`, {
 *     headers: authHeaders,
 *   })
 *   const page2 = await $fetch(`/api/monitors/${monitorId}/results?limit=5&offset=5`, {
 *     headers: authHeaders,
 *   })
 *   // No overlap between pages
 *   const page1Ids = new Set(page1.map(r => r.id))
 *   expect(page2.every(r => !page1Ids.has(r.id))).toBe(true)
 * })
 *
 * it('returns results ordered by executedAt descending', async () => {
 *   const results = await $fetch(`/api/monitors/${monitorId}/results`, {
 *     headers: authHeaders,
 *   })
 *   for (let i = 1; i < results.length; i++) {
 *     expect(new Date(results[i-1].executedAt).getTime())
 *       .toBeGreaterThanOrEqual(new Date(results[i].executedAt).getTime())
 *   }
 * })
 *
 * it('returns 404 for a non-existent monitor id', async () => {
 *   await expect(
 *     $fetch('/api/monitors/non-existent/results', { headers: authHeaders }),
 *   ).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('returns 404 when accessing another user\'s monitor results', async () => {
 *   await expect(
 *     $fetch(`/api/monitors/${userAMonitorId}/results`, { headers: userBHeaders }),
 *   ).rejects.toMatchObject({ statusCode: 404 })
 * })
 *
 * it('serializes executedAt as ISO string', async () => {
 *   const results = await $fetch(`/api/monitors/${monitorId}/results`, {
 *     headers: authHeaders,
 *   })
 *   for (const r of results) {
 *     expect(r.executedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
 *   }
 * })
 *
 * -------------------------------------------------------------------------
 * POST /api/monitors/check
 * -------------------------------------------------------------------------
 *
 * it('returns 401 when no auth session is present', async () => {
 *   await expect($fetch('/api/monitors/check', {
 *     method: 'POST',
 *     ignoreResponseError: true,
 *   })).rejects.toMatchObject({ statusCode: 401 })
 * })
 *
 * it('triggers checks and returns success with count', async () => {
 *   const result = await $fetch('/api/monitors/check', {
 *     method: 'POST',
 *     headers: authHeaders,
 *   })
 *   expect(result.success).toBe(true)
 *   expect(typeof result.checked).toBe('number')
 *   expect(result.timestamp).toBeDefined()
 * })
 *
 * it('returns a valid ISO timestamp', async () => {
 *   const result = await $fetch('/api/monitors/check', {
 *     method: 'POST',
 *     headers: authHeaders,
 *   })
 *   expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
 * })
 *
 * it('returns 500 when runAllChecks fails', async () => {
 *   // Would need to mock runAllChecks to throw
 *   // expect the endpoint to catch and return 500
 * })
 */
