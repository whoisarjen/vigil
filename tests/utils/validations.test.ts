import { describe, it, expect } from 'vitest'
import {
  createMonitorSchema,
  updateMonitorSchema,
  createStatusPageSchema,
  updateStatusPageSchema,
  createIncidentSchema,
  updateIncidentSchema,
} from '~/server/utils/validations'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid input for createMonitorSchema (all required fields). */
const validMonitor = {
  name: 'My Monitor',
  url: 'https://example.com',
  scheduleInterval: 60,
}

/** Minimal valid input for createStatusPageSchema. */
const validStatusPage = {
  slug: 'my-status',
  title: 'Status Page',
}

/** Minimal valid input for createIncidentSchema. */
const validIncident = {
  statusPageId: 'sp_abc123',
  title: 'Something broke',
  message: 'We are looking into this.',
}

// ===========================================================================
// createMonitorSchema
// ===========================================================================

describe('createMonitorSchema', () => {
  // -----------------------------------------------------------------------
  // Full valid parse
  // -----------------------------------------------------------------------

  it('should parse a minimal valid monitor and apply defaults', () => {
    const result = createMonitorSchema.safeParse(validMonitor)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toMatchObject({
      name: 'My Monitor',
      url: 'https://example.com',
      method: 'GET',
      expectedStatus: 200,
      timeoutMs: 5000,
      scheduleInterval: 60,
      headers: {},
      enabled: true,
    })
    expect(result.data.body).toBeUndefined()
  })

  it('should parse a fully-specified valid monitor', () => {
    const input = {
      name: 'Full Monitor',
      url: 'https://api.example.com/health',
      method: 'POST',
      expectedStatus: 201,
      timeoutMs: 10000,
      scheduleInterval: 1440,
      headers: { Authorization: 'Bearer token' },
      body: '{"ping": true}',
      enabled: false,
    }
    const result = createMonitorSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toMatchObject(input)
  })

  // -----------------------------------------------------------------------
  // name
  // -----------------------------------------------------------------------

  describe('name', () => {
    it('should accept a 1-character name', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, name: 'A' })
      expect(r.success).toBe(true)
    })

    it('should accept a 100-character name', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, name: 'a'.repeat(100) })
      expect(r.success).toBe(true)
    })

    it('should reject an empty name', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, name: '' })
      expect(r.success).toBe(false)
    })

    it('should reject a name exceeding 100 characters', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, name: 'a'.repeat(101) })
      expect(r.success).toBe(false)
    })

    it('should reject a missing name', () => {
      const { name, ...noName } = validMonitor
      const r = createMonitorSchema.safeParse(noName)
      expect(r.success).toBe(false)
    })

    it('should reject null as name', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, name: null })
      expect(r.success).toBe(false)
    })

    it('should reject a number as name', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, name: 42 })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // url
  // -----------------------------------------------------------------------

  describe('url', () => {
    it('should accept a valid https URL', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, url: 'https://example.com' })
      expect(r.success).toBe(true)
    })

    it('should accept a valid http URL', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, url: 'http://example.com' })
      expect(r.success).toBe(true)
    })

    it('should accept a URL with path, query, and port', () => {
      const r = createMonitorSchema.safeParse({
        ...validMonitor,
        url: 'https://api.example.com:8080/v1/health?check=true',
      })
      expect(r.success).toBe(true)
    })

    it('should reject a URL without protocol', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, url: 'example.com' })
      expect(r.success).toBe(false)
    })

    it('should reject an empty string URL', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, url: '' })
      expect(r.success).toBe(false)
    })

    it('should reject a URL with spaces', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, url: 'https://example .com' })
      expect(r.success).toBe(false)
    })

    it('should reject a missing url', () => {
      const { url, ...noUrl } = validMonitor
      const r = createMonitorSchema.safeParse(noUrl)
      expect(r.success).toBe(false)
    })

    it('should reject just a protocol', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, url: 'https://' })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // method
  // -----------------------------------------------------------------------

  describe('method', () => {
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'] as const

    validMethods.forEach((method) => {
      it(`should accept method "${method}"`, () => {
        const r = createMonitorSchema.safeParse({ ...validMonitor, method })
        expect(r.success).toBe(true)
        if (r.success) expect(r.data.method).toBe(method)
      })
    })

    it('should default to GET when method is not specified', () => {
      const r = createMonitorSchema.safeParse(validMonitor)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.method).toBe('GET')
    })

    it('should reject an invalid method string', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, method: 'OPTIONS' })
      expect(r.success).toBe(false)
    })

    it('should reject a lowercase method', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, method: 'get' })
      expect(r.success).toBe(false)
    })

    it('should reject a number as method', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, method: 1 })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // expectedStatus
  // -----------------------------------------------------------------------

  describe('expectedStatus', () => {
    it('should default to 200 when not specified', () => {
      const r = createMonitorSchema.safeParse(validMonitor)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.expectedStatus).toBe(200)
    })

    it('should accept 100 (lower bound)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: 100 })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.expectedStatus).toBe(100)
    })

    it('should accept 599 (upper bound)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: 599 })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.expectedStatus).toBe(599)
    })

    it('should accept 204 No Content', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: 204 })
      expect(r.success).toBe(true)
    })

    it('should reject 0', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: 0 })
      expect(r.success).toBe(false)
    })

    it('should reject 99 (below lower bound)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: 99 })
      expect(r.success).toBe(false)
    })

    it('should reject 600 (above upper bound)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: 600 })
      expect(r.success).toBe(false)
    })

    it('should reject negative numbers', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: -200 })
      expect(r.success).toBe(false)
    })

    it('should coerce a string number to a number', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: '201' })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.expectedStatus).toBe(201)
    })

    it('should reject a non-numeric string', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: 'abc' })
      expect(r.success).toBe(false)
    })

    it('should reject a float value', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, expectedStatus: 200.5 })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // timeoutMs
  // -----------------------------------------------------------------------

  describe('timeoutMs', () => {
    it('should default to 5000 when not specified', () => {
      const r = createMonitorSchema.safeParse(validMonitor)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.timeoutMs).toBe(5000)
    })

    it('should accept 1000 (lower bound)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, timeoutMs: 1000 })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.timeoutMs).toBe(1000)
    })

    it('should accept 15000 (upper bound)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, timeoutMs: 15000 })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.timeoutMs).toBe(15000)
    })

    it('should reject 999 (below lower bound)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, timeoutMs: 999 })
      expect(r.success).toBe(false)
    })

    it('should reject 15001 (above upper bound)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, timeoutMs: 15001 })
      expect(r.success).toBe(false)
    })

    it('should reject a negative number', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, timeoutMs: -1 })
      expect(r.success).toBe(false)
    })

    it('should reject 0', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, timeoutMs: 0 })
      expect(r.success).toBe(false)
    })

    it('should coerce a string to a number', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, timeoutMs: '3000' })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.timeoutMs).toBe(3000)
    })

    it('should reject a float value', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, timeoutMs: 5000.5 })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // scheduleInterval
  // -----------------------------------------------------------------------

  describe('scheduleInterval', () => {
    const validIntervals = [15, 30, 60, 120, 360, 720, 1440]

    validIntervals.forEach((interval) => {
      it(`should accept valid interval ${interval}`, () => {
        const r = createMonitorSchema.safeParse({ ...validMonitor, scheduleInterval: interval })
        expect(r.success).toBe(true)
        if (r.success) expect(r.data.scheduleInterval).toBe(interval)
      })
    })

    it('should reject an interval not in the allowed list (e.g. 45)', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, scheduleInterval: 45 })
      expect(r.success).toBe(false)
    })

    it('should reject 0', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, scheduleInterval: 0 })
      expect(r.success).toBe(false)
    })

    it('should reject a negative interval', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, scheduleInterval: -15 })
      expect(r.success).toBe(false)
    })

    it('should reject a missing scheduleInterval', () => {
      const { scheduleInterval, ...noInterval } = validMonitor
      const r = createMonitorSchema.safeParse(noInterval)
      expect(r.success).toBe(false)
    })

    it('should coerce a valid string interval to a number', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, scheduleInterval: '60' })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.scheduleInterval).toBe(60)
    })

    it('should reject a non-numeric string', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, scheduleInterval: 'hourly' })
      expect(r.success).toBe(false)
    })

    it('should reject a float value', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, scheduleInterval: 60.5 })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // headers
  // -----------------------------------------------------------------------

  describe('headers', () => {
    it('should default to an empty object when not specified', () => {
      const r = createMonitorSchema.safeParse(validMonitor)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.headers).toEqual({})
    })

    it('should accept a valid headers object', () => {
      const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer x' }
      const r = createMonitorSchema.safeParse({ ...validMonitor, headers })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.headers).toEqual(headers)
    })

    it('should accept an empty object', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, headers: {} })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.headers).toEqual({})
    })

    it('should reject an array for headers', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, headers: ['a', 'b'] })
      expect(r.success).toBe(false)
    })

    it('should reject headers with non-string values', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, headers: { key: 123 } })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // body
  // -----------------------------------------------------------------------

  describe('body', () => {
    it('should accept a string body', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, body: '{"data":1}' })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.body).toBe('{"data":1}')
    })

    it('should accept null body', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, body: null })
      expect(r.success).toBe(true)
    })

    it('should accept undefined (omitted) body', () => {
      const r = createMonitorSchema.safeParse(validMonitor)
      expect(r.success).toBe(true)
    })

    it('should accept an empty string body', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, body: '' })
      expect(r.success).toBe(true)
    })

    it('should reject a number as body', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, body: 42 })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // enabled
  // -----------------------------------------------------------------------

  describe('enabled', () => {
    it('should default to true when not specified', () => {
      const r = createMonitorSchema.safeParse(validMonitor)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.enabled).toBe(true)
    })

    it('should accept explicit true', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, enabled: true })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.enabled).toBe(true)
    })

    it('should accept explicit false', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, enabled: false })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.enabled).toBe(false)
    })

    it('should coerce a truthy string to true', () => {
      const r = createMonitorSchema.safeParse({ ...validMonitor, enabled: 'true' })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.enabled).toBe(true)
    })
  })
})

// ===========================================================================
// updateMonitorSchema
// ===========================================================================

describe('updateMonitorSchema', () => {
  it('should accept an empty object (all fields optional)', () => {
    const r = updateMonitorSchema.safeParse({})
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only name', () => {
    const r = updateMonitorSchema.safeParse({ name: 'Renamed' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.name).toBe('Renamed')
  })

  it('should accept a partial update with only url', () => {
    const r = updateMonitorSchema.safeParse({ url: 'https://new.example.com' })
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only method', () => {
    const r = updateMonitorSchema.safeParse({ method: 'POST' })
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only expectedStatus', () => {
    const r = updateMonitorSchema.safeParse({ expectedStatus: 404 })
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only timeoutMs', () => {
    const r = updateMonitorSchema.safeParse({ timeoutMs: 3000 })
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only scheduleInterval', () => {
    const r = updateMonitorSchema.safeParse({ scheduleInterval: 720 })
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only enabled', () => {
    const r = updateMonitorSchema.safeParse({ enabled: false })
    expect(r.success).toBe(true)
  })

  it('should still validate field constraints — reject name over 100 chars', () => {
    const r = updateMonitorSchema.safeParse({ name: 'x'.repeat(101) })
    expect(r.success).toBe(false)
  })

  it('should still validate field constraints — reject invalid URL', () => {
    const r = updateMonitorSchema.safeParse({ url: 'not-a-url' })
    expect(r.success).toBe(false)
  })

  it('should still validate field constraints — reject invalid method', () => {
    const r = updateMonitorSchema.safeParse({ method: 'CONNECT' })
    expect(r.success).toBe(false)
  })

  it('should still validate field constraints — reject expectedStatus out of range', () => {
    const r = updateMonitorSchema.safeParse({ expectedStatus: 600 })
    expect(r.success).toBe(false)
  })

  it('should still validate field constraints — reject timeoutMs out of range', () => {
    const r = updateMonitorSchema.safeParse({ timeoutMs: 999 })
    expect(r.success).toBe(false)
  })

  it('should still validate field constraints — reject invalid scheduleInterval', () => {
    const r = updateMonitorSchema.safeParse({ scheduleInterval: 999 })
    expect(r.success).toBe(false)
  })

  it('should accept multiple valid fields at once', () => {
    const r = updateMonitorSchema.safeParse({
      name: 'Updated',
      method: 'PUT',
      expectedStatus: 204,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.name).toBe('Updated')
      expect(r.data.method).toBe('PUT')
      expect(r.data.expectedStatus).toBe(204)
    }
  })
})

// ===========================================================================
// createStatusPageSchema
// ===========================================================================

describe('createStatusPageSchema', () => {
  // -----------------------------------------------------------------------
  // Full valid parse
  // -----------------------------------------------------------------------

  it('should parse a minimal valid status page and apply defaults', () => {
    const r = createStatusPageSchema.safeParse(validStatusPage)
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.data).toMatchObject({
      slug: 'my-status',
      title: 'Status Page',
      isPublic: true,
      monitorIds: [],
    })
  })

  it('should parse a fully-specified valid status page', () => {
    const input = {
      slug: 'acme-corp',
      title: 'Acme Corp Status',
      description: 'Public system status for Acme.',
      isPublic: false,
      monitorIds: ['mon_1', 'mon_2'],
    }
    const r = createStatusPageSchema.safeParse(input)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toMatchObject(input)
  })

  // -----------------------------------------------------------------------
  // slug
  // -----------------------------------------------------------------------

  describe('slug', () => {
    it('should accept a 3-character slug (lower bound)', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'abc' })
      expect(r.success).toBe(true)
    })

    it('should accept a 50-character slug (upper bound)', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'a'.repeat(50) })
      expect(r.success).toBe(true)
    })

    it('should accept a slug with hyphens and numbers', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'my-status-123' })
      expect(r.success).toBe(true)
    })

    it('should reject a slug shorter than 3 characters', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'ab' })
      expect(r.success).toBe(false)
    })

    it('should reject a slug longer than 50 characters', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'a'.repeat(51) })
      expect(r.success).toBe(false)
    })

    it('should reject a slug with uppercase letters', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'My-Status' })
      expect(r.success).toBe(false)
    })

    it('should reject a slug with spaces', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'my status' })
      expect(r.success).toBe(false)
    })

    it('should reject a slug with underscores', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'my_status' })
      expect(r.success).toBe(false)
    })

    it('should reject a slug with special characters', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'my@status!' })
      expect(r.success).toBe(false)
    })

    it('should reject an empty slug', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: '' })
      expect(r.success).toBe(false)
    })

    it('should reject a missing slug', () => {
      const { slug, ...noSlug } = validStatusPage
      const r = createStatusPageSchema.safeParse(noSlug)
      expect(r.success).toBe(false)
    })

    it('should reject a slug with dots', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, slug: 'my.status' })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // title
  // -----------------------------------------------------------------------

  describe('title', () => {
    it('should accept a 1-character title', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, title: 'A' })
      expect(r.success).toBe(true)
    })

    it('should accept a 100-character title', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, title: 't'.repeat(100) })
      expect(r.success).toBe(true)
    })

    it('should reject an empty title', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, title: '' })
      expect(r.success).toBe(false)
    })

    it('should reject a title exceeding 100 characters', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, title: 't'.repeat(101) })
      expect(r.success).toBe(false)
    })

    it('should reject a missing title', () => {
      const { title, ...noTitle } = validStatusPage
      const r = createStatusPageSchema.safeParse(noTitle)
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // description
  // -----------------------------------------------------------------------

  describe('description', () => {
    it('should accept a valid description string', () => {
      const r = createStatusPageSchema.safeParse({
        ...validStatusPage,
        description: 'System status overview',
      })
      expect(r.success).toBe(true)
    })

    it('should accept a description of exactly 500 characters', () => {
      const r = createStatusPageSchema.safeParse({
        ...validStatusPage,
        description: 'd'.repeat(500),
      })
      expect(r.success).toBe(true)
    })

    it('should reject a description exceeding 500 characters', () => {
      const r = createStatusPageSchema.safeParse({
        ...validStatusPage,
        description: 'd'.repeat(501),
      })
      expect(r.success).toBe(false)
    })

    it('should accept null description', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, description: null })
      expect(r.success).toBe(true)
    })

    it('should accept undefined (omitted) description', () => {
      const r = createStatusPageSchema.safeParse(validStatusPage)
      expect(r.success).toBe(true)
    })

    it('should accept an empty string description', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, description: '' })
      expect(r.success).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // isPublic
  // -----------------------------------------------------------------------

  describe('isPublic', () => {
    it('should default to true when not specified', () => {
      const r = createStatusPageSchema.safeParse(validStatusPage)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.isPublic).toBe(true)
    })

    it('should accept explicit false', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, isPublic: false })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.isPublic).toBe(false)
    })

    it('should accept explicit true', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, isPublic: true })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.isPublic).toBe(true)
    })
  })

  // -----------------------------------------------------------------------
  // monitorIds
  // -----------------------------------------------------------------------

  describe('monitorIds', () => {
    it('should default to an empty array when not specified', () => {
      const r = createStatusPageSchema.safeParse(validStatusPage)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.monitorIds).toEqual([])
    })

    it('should accept an array of strings', () => {
      const r = createStatusPageSchema.safeParse({
        ...validStatusPage,
        monitorIds: ['id-1', 'id-2', 'id-3'],
      })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.monitorIds).toEqual(['id-1', 'id-2', 'id-3'])
    })

    it('should accept an empty array', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, monitorIds: [] })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.monitorIds).toEqual([])
    })

    it('should reject an array with non-string elements', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, monitorIds: [1, 2] })
      expect(r.success).toBe(false)
    })

    it('should reject a string instead of an array', () => {
      const r = createStatusPageSchema.safeParse({ ...validStatusPage, monitorIds: 'id-1' })
      expect(r.success).toBe(false)
    })
  })
})

// ===========================================================================
// updateStatusPageSchema
// ===========================================================================

describe('updateStatusPageSchema', () => {
  it('should accept an empty object (all fields optional)', () => {
    const r = updateStatusPageSchema.safeParse({})
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only slug', () => {
    const r = updateStatusPageSchema.safeParse({ slug: 'new-slug' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.slug).toBe('new-slug')
  })

  it('should accept a partial update with only title', () => {
    const r = updateStatusPageSchema.safeParse({ title: 'New Title' })
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only description', () => {
    const r = updateStatusPageSchema.safeParse({ description: 'Updated desc' })
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only isPublic', () => {
    const r = updateStatusPageSchema.safeParse({ isPublic: false })
    expect(r.success).toBe(true)
  })

  it('should accept a partial update with only monitorIds', () => {
    const r = updateStatusPageSchema.safeParse({ monitorIds: ['id-new'] })
    expect(r.success).toBe(true)
  })

  it('should still validate slug constraints — reject uppercase', () => {
    const r = updateStatusPageSchema.safeParse({ slug: 'INVALID' })
    expect(r.success).toBe(false)
  })

  it('should still validate slug constraints — reject too short', () => {
    const r = updateStatusPageSchema.safeParse({ slug: 'ab' })
    expect(r.success).toBe(false)
  })

  it('should still validate title constraints — reject empty', () => {
    const r = updateStatusPageSchema.safeParse({ title: '' })
    expect(r.success).toBe(false)
  })

  it('should still validate description constraints — reject over 500 chars', () => {
    const r = updateStatusPageSchema.safeParse({ description: 'x'.repeat(501) })
    expect(r.success).toBe(false)
  })

  it('should accept multiple valid fields at once', () => {
    const r = updateStatusPageSchema.safeParse({
      title: 'Updated',
      isPublic: false,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.title).toBe('Updated')
      expect(r.data.isPublic).toBe(false)
    }
  })
})

// ===========================================================================
// createIncidentSchema
// ===========================================================================

describe('createIncidentSchema', () => {
  // -----------------------------------------------------------------------
  // Full valid parse
  // -----------------------------------------------------------------------

  it('should parse a minimal valid incident and apply defaults', () => {
    const r = createIncidentSchema.safeParse(validIncident)
    expect(r.success).toBe(true)
    if (!r.success) return
    expect(r.data).toMatchObject({
      statusPageId: 'sp_abc123',
      title: 'Something broke',
      status: 'investigating',
      impact: 'minor',
      message: 'We are looking into this.',
      monitorIds: [],
    })
  })

  it('should parse a fully-specified valid incident', () => {
    const input = {
      statusPageId: 'sp_xyz',
      title: 'API Degradation',
      status: 'identified' as const,
      impact: 'major' as const,
      message: 'The root cause has been identified.',
      monitorIds: ['mon_1'],
    }
    const r = createIncidentSchema.safeParse(input)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toMatchObject(input)
  })

  // -----------------------------------------------------------------------
  // statusPageId
  // -----------------------------------------------------------------------

  describe('statusPageId', () => {
    it('should accept a non-empty string', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, statusPageId: 'a' })
      expect(r.success).toBe(true)
    })

    it('should reject an empty statusPageId', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, statusPageId: '' })
      expect(r.success).toBe(false)
    })

    it('should reject a missing statusPageId', () => {
      const { statusPageId, ...noId } = validIncident
      const r = createIncidentSchema.safeParse(noId)
      expect(r.success).toBe(false)
    })

    it('should reject null as statusPageId', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, statusPageId: null })
      expect(r.success).toBe(false)
    })

    it('should reject a number as statusPageId', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, statusPageId: 123 })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // title
  // -----------------------------------------------------------------------

  describe('title', () => {
    it('should accept a 1-character title', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, title: 'X' })
      expect(r.success).toBe(true)
    })

    it('should accept a 200-character title', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, title: 't'.repeat(200) })
      expect(r.success).toBe(true)
    })

    it('should reject an empty title', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, title: '' })
      expect(r.success).toBe(false)
    })

    it('should reject a title exceeding 200 characters', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, title: 't'.repeat(201) })
      expect(r.success).toBe(false)
    })

    it('should reject a missing title', () => {
      const { title, ...noTitle } = validIncident
      const r = createIncidentSchema.safeParse(noTitle)
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // status
  // -----------------------------------------------------------------------

  describe('status', () => {
    const validStatuses = ['investigating', 'identified', 'monitoring', 'resolved'] as const

    validStatuses.forEach((status) => {
      it(`should accept status "${status}"`, () => {
        const r = createIncidentSchema.safeParse({ ...validIncident, status })
        expect(r.success).toBe(true)
        if (r.success) expect(r.data.status).toBe(status)
      })
    })

    it('should default to "investigating" when not specified', () => {
      const r = createIncidentSchema.safeParse(validIncident)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.status).toBe('investigating')
    })

    it('should reject an invalid status string', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, status: 'open' })
      expect(r.success).toBe(false)
    })

    it('should reject a number as status', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, status: 1 })
      expect(r.success).toBe(false)
    })

    it('should reject an uppercase variant', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, status: 'Resolved' })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // impact
  // -----------------------------------------------------------------------

  describe('impact', () => {
    const validImpacts = ['none', 'minor', 'major', 'critical'] as const

    validImpacts.forEach((impact) => {
      it(`should accept impact "${impact}"`, () => {
        const r = createIncidentSchema.safeParse({ ...validIncident, impact })
        expect(r.success).toBe(true)
        if (r.success) expect(r.data.impact).toBe(impact)
      })
    })

    it('should default to "minor" when not specified', () => {
      const r = createIncidentSchema.safeParse(validIncident)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.impact).toBe('minor')
    })

    it('should reject an invalid impact string', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, impact: 'severe' })
      expect(r.success).toBe(false)
    })

    it('should reject a number as impact', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, impact: 3 })
      expect(r.success).toBe(false)
    })

    it('should reject an uppercase variant', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, impact: 'Critical' })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // message
  // -----------------------------------------------------------------------

  describe('message', () => {
    it('should accept a 1-character message', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, message: 'M' })
      expect(r.success).toBe(true)
    })

    it('should accept a 2000-character message', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, message: 'm'.repeat(2000) })
      expect(r.success).toBe(true)
    })

    it('should reject an empty message', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, message: '' })
      expect(r.success).toBe(false)
    })

    it('should reject a message exceeding 2000 characters', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, message: 'm'.repeat(2001) })
      expect(r.success).toBe(false)
    })

    it('should reject a missing message', () => {
      const { message, ...noMessage } = validIncident
      const r = createIncidentSchema.safeParse(noMessage)
      expect(r.success).toBe(false)
    })

    it('should reject null as message', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, message: null })
      expect(r.success).toBe(false)
    })
  })

  // -----------------------------------------------------------------------
  // monitorIds
  // -----------------------------------------------------------------------

  describe('monitorIds', () => {
    it('should default to an empty array when not specified', () => {
      const r = createIncidentSchema.safeParse(validIncident)
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.monitorIds).toEqual([])
    })

    it('should accept an array of strings', () => {
      const r = createIncidentSchema.safeParse({
        ...validIncident,
        monitorIds: ['m1', 'm2'],
      })
      expect(r.success).toBe(true)
      if (r.success) expect(r.data.monitorIds).toEqual(['m1', 'm2'])
    })

    it('should accept an empty array', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, monitorIds: [] })
      expect(r.success).toBe(true)
    })

    it('should reject an array with non-string elements', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, monitorIds: [1, 2] })
      expect(r.success).toBe(false)
    })

    it('should reject a plain string instead of an array', () => {
      const r = createIncidentSchema.safeParse({ ...validIncident, monitorIds: 'mon_1' })
      expect(r.success).toBe(false)
    })
  })
})

// ===========================================================================
// updateIncidentSchema
// ===========================================================================

describe('updateIncidentSchema', () => {
  it('should accept an empty object (all fields optional)', () => {
    const r = updateIncidentSchema.safeParse({})
    expect(r.success).toBe(true)
  })

  // -----------------------------------------------------------------------
  // title
  // -----------------------------------------------------------------------

  it('should accept a valid title update', () => {
    const r = updateIncidentSchema.safeParse({ title: 'Updated title' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.title).toBe('Updated title')
  })

  it('should reject an empty title', () => {
    const r = updateIncidentSchema.safeParse({ title: '' })
    expect(r.success).toBe(false)
  })

  it('should reject a title exceeding 200 characters', () => {
    const r = updateIncidentSchema.safeParse({ title: 'x'.repeat(201) })
    expect(r.success).toBe(false)
  })

  // -----------------------------------------------------------------------
  // status
  // -----------------------------------------------------------------------

  it('should accept a valid status update', () => {
    const r = updateIncidentSchema.safeParse({ status: 'resolved' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.status).toBe('resolved')
  })

  it('should reject an invalid status', () => {
    const r = updateIncidentSchema.safeParse({ status: 'closed' })
    expect(r.success).toBe(false)
  })

  // -----------------------------------------------------------------------
  // impact
  // -----------------------------------------------------------------------

  it('should accept a valid impact update', () => {
    const r = updateIncidentSchema.safeParse({ impact: 'critical' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.impact).toBe('critical')
  })

  it('should reject an invalid impact', () => {
    const r = updateIncidentSchema.safeParse({ impact: 'high' })
    expect(r.success).toBe(false)
  })

  // -----------------------------------------------------------------------
  // message
  // -----------------------------------------------------------------------

  it('should accept a valid message update', () => {
    const r = updateIncidentSchema.safeParse({ message: 'Fix deployed.' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.message).toBe('Fix deployed.')
  })

  it('should reject an empty message', () => {
    const r = updateIncidentSchema.safeParse({ message: '' })
    expect(r.success).toBe(false)
  })

  it('should reject a message exceeding 2000 characters', () => {
    const r = updateIncidentSchema.safeParse({ message: 'z'.repeat(2001) })
    expect(r.success).toBe(false)
  })

  // -----------------------------------------------------------------------
  // Combination & absence of non-present fields
  // -----------------------------------------------------------------------

  it('should accept multiple valid fields at once', () => {
    const r = updateIncidentSchema.safeParse({
      title: 'Post-mortem added',
      status: 'resolved',
      impact: 'none',
      message: 'All clear.',
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.title).toBe('Post-mortem added')
      expect(r.data.status).toBe('resolved')
      expect(r.data.impact).toBe('none')
      expect(r.data.message).toBe('All clear.')
    }
  })

  it('should NOT include statusPageId (not part of update schema)', () => {
    const r = updateIncidentSchema.safeParse({ statusPageId: 'sp_123' })
    expect(r.success).toBe(true)
    if (r.success) {
      // statusPageId is not defined on updateIncidentSchema, so it should be stripped
      expect((r.data as Record<string, unknown>).statusPageId).toBeUndefined()
    }
  })

  it('should NOT include monitorIds (not part of update schema)', () => {
    const r = updateIncidentSchema.safeParse({ monitorIds: ['m1'] })
    expect(r.success).toBe(true)
    if (r.success) {
      expect((r.data as Record<string, unknown>).monitorIds).toBeUndefined()
    }
  })
})
