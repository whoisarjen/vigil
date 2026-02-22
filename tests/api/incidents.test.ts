import { describe, it, expect } from 'vitest'
import {
  createIncidentSchema,
  updateIncidentSchema,
} from '~~/server/utils/validations'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A valid UUID-v4 value used across tests for statusPageId / monitorIds. */
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

/** Returns a complete, valid payload for createIncidentSchema. */
function validCreatePayload(overrides: Record<string, unknown> = {}) {
  return {
    statusPageId: VALID_UUID,
    title: 'Database connectivity issues',
    status: 'investigating' as const,
    impact: 'major' as const,
    message: 'We are currently investigating elevated error rates on database connections.',
    monitorIds: [],
    ...overrides,
  }
}

// ===========================================================================
// createIncidentSchema
// ===========================================================================

describe('createIncidentSchema', () => {
  // -------------------------------------------------------------------------
  // Happy-path
  // -------------------------------------------------------------------------

  it('accepts a fully valid payload with all fields', () => {
    const result = createIncidentSchema.safeParse(validCreatePayload())
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.statusPageId).toBe(VALID_UUID)
      expect(result.data.title).toBe('Database connectivity issues')
      expect(result.data.status).toBe('investigating')
      expect(result.data.impact).toBe('major')
      expect(result.data.message).toContain('elevated error rates')
      expect(result.data.monitorIds).toEqual([])
    }
  })

  it('applies default status "investigating" when status is omitted', () => {
    const { status, ...rest } = validCreatePayload()
    const result = createIncidentSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('investigating')
    }
  })

  it('applies default impact "minor" when impact is omitted', () => {
    const { impact, ...rest } = validCreatePayload()
    const result = createIncidentSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.impact).toBe('minor')
    }
  })

  it('applies default empty array for monitorIds when omitted', () => {
    const { monitorIds, ...rest } = validCreatePayload()
    const result = createIncidentSchema.safeParse(rest)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.monitorIds).toEqual([])
    }
  })

  it('accepts monitorIds as an array of strings', () => {
    const ids = [VALID_UUID, '660e8400-e29b-41d4-a716-446655440001']
    const result = createIncidentSchema.safeParse(
      validCreatePayload({ monitorIds: ids }),
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.monitorIds).toEqual(ids)
    }
  })

  // -------------------------------------------------------------------------
  // statusPageId
  // -------------------------------------------------------------------------

  describe('statusPageId', () => {
    it('rejects when statusPageId is missing', () => {
      const { statusPageId, ...rest } = validCreatePayload()
      const result = createIncidentSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('rejects empty string statusPageId', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ statusPageId: '' }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects null statusPageId', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ statusPageId: null }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects numeric statusPageId', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ statusPageId: 12345 }),
      )
      expect(result.success).toBe(false)
    })

    it('accepts any non-empty string as statusPageId', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ statusPageId: 'any-non-empty-string' }),
      )
      expect(result.success).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // title
  // -------------------------------------------------------------------------

  describe('title', () => {
    it('rejects when title is missing', () => {
      const { title, ...rest } = validCreatePayload()
      const result = createIncidentSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('rejects empty string title', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ title: '' }),
      )
      expect(result.success).toBe(false)
    })

    it('accepts a title of exactly 1 character', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ title: 'A' }),
      )
      expect(result.success).toBe(true)
    })

    it('accepts a title of exactly 200 characters', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ title: 'x'.repeat(200) }),
      )
      expect(result.success).toBe(true)
    })

    it('rejects a title longer than 200 characters', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ title: 'x'.repeat(201) }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects null title', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ title: null }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects numeric title', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ title: 42 }),
      )
      expect(result.success).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // status
  // -------------------------------------------------------------------------

  describe('status', () => {
    const validStatuses = ['investigating', 'identified', 'monitoring', 'resolved'] as const

    it.each(validStatuses)('accepts valid status "%s"', (status) => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ status }),
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(status)
      }
    })

    it('rejects an invalid status value', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ status: 'open' }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects numeric status', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ status: 1 }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects null status', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ status: null }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects status with wrong casing', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ status: 'Investigating' }),
      )
      expect(result.success).toBe(false)
    })

    it('defaults to "investigating" when status is undefined', () => {
      const payload = validCreatePayload()
      delete (payload as Record<string, unknown>).status
      const result = createIncidentSchema.safeParse(payload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('investigating')
      }
    })
  })

  // -------------------------------------------------------------------------
  // impact
  // -------------------------------------------------------------------------

  describe('impact', () => {
    const validImpacts = ['none', 'minor', 'major', 'critical'] as const

    it.each(validImpacts)('accepts valid impact "%s"', (impact) => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ impact }),
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBe(impact)
      }
    })

    it('rejects an invalid impact value', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ impact: 'severe' }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects numeric impact', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ impact: 3 }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects null impact', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ impact: null }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects impact with wrong casing', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ impact: 'Critical' }),
      )
      expect(result.success).toBe(false)
    })

    it('defaults to "minor" when impact is undefined', () => {
      const payload = validCreatePayload()
      delete (payload as Record<string, unknown>).impact
      const result = createIncidentSchema.safeParse(payload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBe('minor')
      }
    })
  })

  // -------------------------------------------------------------------------
  // message
  // -------------------------------------------------------------------------

  describe('message', () => {
    it('rejects when message is missing', () => {
      const { message, ...rest } = validCreatePayload()
      const result = createIncidentSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('rejects empty string message', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ message: '' }),
      )
      expect(result.success).toBe(false)
    })

    it('accepts a message of exactly 1 character', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ message: 'A' }),
      )
      expect(result.success).toBe(true)
    })

    it('accepts a message of exactly 2000 characters', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ message: 'm'.repeat(2000) }),
      )
      expect(result.success).toBe(true)
    })

    it('rejects a message longer than 2000 characters', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ message: 'm'.repeat(2001) }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects null message', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ message: null }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects numeric message', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ message: 999 }),
      )
      expect(result.success).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // monitorIds
  // -------------------------------------------------------------------------

  describe('monitorIds', () => {
    it('accepts when monitorIds is omitted (defaults to [])', () => {
      const { monitorIds, ...rest } = validCreatePayload()
      const result = createIncidentSchema.safeParse(rest)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monitorIds).toEqual([])
      }
    })

    it('accepts an empty array', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ monitorIds: [] }),
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monitorIds).toEqual([])
      }
    })

    it('accepts an array with multiple string IDs', () => {
      const ids = ['id-1', 'id-2', 'id-3']
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ monitorIds: ids }),
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monitorIds).toEqual(ids)
      }
    })

    it('rejects monitorIds if it is not an array', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ monitorIds: 'not-an-array' }),
      )
      expect(result.success).toBe(false)
    })

    it('rejects monitorIds with non-string elements', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ monitorIds: [123, 456] }),
      )
      expect(result.success).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Completely empty / wrong-type payloads
  // -------------------------------------------------------------------------

  describe('edge cases', () => {
    it('rejects an empty object (missing required fields)', () => {
      const result = createIncidentSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('rejects null payload', () => {
      const result = createIncidentSchema.safeParse(null)
      expect(result.success).toBe(false)
    })

    it('rejects undefined payload', () => {
      const result = createIncidentSchema.safeParse(undefined)
      expect(result.success).toBe(false)
    })

    it('rejects a numeric payload', () => {
      const result = createIncidentSchema.safeParse(42)
      expect(result.success).toBe(false)
    })

    it('rejects a string payload', () => {
      const result = createIncidentSchema.safeParse('hello')
      expect(result.success).toBe(false)
    })

    it('strips unknown properties and still validates', () => {
      const result = createIncidentSchema.safeParse(
        validCreatePayload({ unknownField: 'should-be-ignored' }),
      )
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).unknownField).toBeUndefined()
      }
    })
  })
})

// ===========================================================================
// updateIncidentSchema
// ===========================================================================

describe('updateIncidentSchema', () => {
  // -------------------------------------------------------------------------
  // Happy-path
  // -------------------------------------------------------------------------

  it('accepts a complete valid update payload', () => {
    const result = updateIncidentSchema.safeParse({
      title: 'Updated title',
      status: 'resolved',
      impact: 'none',
      message: 'Issue has been fixed.',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Updated title')
      expect(result.data.status).toBe('resolved')
      expect(result.data.impact).toBe('none')
      expect(result.data.message).toBe('Issue has been fixed.')
    }
  })

  it('accepts an empty object (all fields optional)', () => {
    const result = updateIncidentSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Individual optional fields
  // -------------------------------------------------------------------------

  describe('title (optional)', () => {
    it('accepts a valid title when provided', () => {
      const result = updateIncidentSchema.safeParse({ title: 'New title' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('New title')
      }
    })

    it('rejects empty string title when provided', () => {
      const result = updateIncidentSchema.safeParse({ title: '' })
      expect(result.success).toBe(false)
    })

    it('accepts title of exactly 1 character', () => {
      const result = updateIncidentSchema.safeParse({ title: 'X' })
      expect(result.success).toBe(true)
    })

    it('accepts title of exactly 200 characters', () => {
      const result = updateIncidentSchema.safeParse({ title: 't'.repeat(200) })
      expect(result.success).toBe(true)
    })

    it('rejects title longer than 200 characters', () => {
      const result = updateIncidentSchema.safeParse({ title: 't'.repeat(201) })
      expect(result.success).toBe(false)
    })

    it('rejects non-string title', () => {
      const result = updateIncidentSchema.safeParse({ title: 123 })
      expect(result.success).toBe(false)
    })
  })

  describe('status (optional)', () => {
    const validStatuses = ['investigating', 'identified', 'monitoring', 'resolved'] as const

    it.each(validStatuses)('accepts valid status "%s"', (status) => {
      const result = updateIncidentSchema.safeParse({ status })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(status)
      }
    })

    it('rejects invalid status value', () => {
      const result = updateIncidentSchema.safeParse({ status: 'closed' })
      expect(result.success).toBe(false)
    })

    it('rejects status with wrong casing', () => {
      const result = updateIncidentSchema.safeParse({ status: 'Resolved' })
      expect(result.success).toBe(false)
    })

    it('rejects null status', () => {
      const result = updateIncidentSchema.safeParse({ status: null })
      expect(result.success).toBe(false)
    })
  })

  describe('impact (optional)', () => {
    const validImpacts = ['none', 'minor', 'major', 'critical'] as const

    it.each(validImpacts)('accepts valid impact "%s"', (impact) => {
      const result = updateIncidentSchema.safeParse({ impact })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.impact).toBe(impact)
      }
    })

    it('rejects invalid impact value', () => {
      const result = updateIncidentSchema.safeParse({ impact: 'low' })
      expect(result.success).toBe(false)
    })

    it('rejects impact with wrong casing', () => {
      const result = updateIncidentSchema.safeParse({ impact: 'Major' })
      expect(result.success).toBe(false)
    })

    it('rejects null impact', () => {
      const result = updateIncidentSchema.safeParse({ impact: null })
      expect(result.success).toBe(false)
    })
  })

  describe('message (optional)', () => {
    it('accepts a valid message when provided', () => {
      const result = updateIncidentSchema.safeParse({ message: 'Looking into it.' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.message).toBe('Looking into it.')
      }
    })

    it('rejects empty string message', () => {
      const result = updateIncidentSchema.safeParse({ message: '' })
      expect(result.success).toBe(false)
    })

    it('accepts message of exactly 1 character', () => {
      const result = updateIncidentSchema.safeParse({ message: 'M' })
      expect(result.success).toBe(true)
    })

    it('accepts message of exactly 2000 characters', () => {
      const result = updateIncidentSchema.safeParse({ message: 'z'.repeat(2000) })
      expect(result.success).toBe(true)
    })

    it('rejects message longer than 2000 characters', () => {
      const result = updateIncidentSchema.safeParse({ message: 'z'.repeat(2001) })
      expect(result.success).toBe(false)
    })

    it('rejects non-string message', () => {
      const result = updateIncidentSchema.safeParse({ message: true })
      expect(result.success).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Combinations
  // -------------------------------------------------------------------------

  describe('partial combinations', () => {
    it('accepts only title', () => {
      const result = updateIncidentSchema.safeParse({ title: 'Just a title' })
      expect(result.success).toBe(true)
    })

    it('accepts only status', () => {
      const result = updateIncidentSchema.safeParse({ status: 'monitoring' })
      expect(result.success).toBe(true)
    })

    it('accepts only impact', () => {
      const result = updateIncidentSchema.safeParse({ impact: 'critical' })
      expect(result.success).toBe(true)
    })

    it('accepts only message', () => {
      const result = updateIncidentSchema.safeParse({ message: 'Status update.' })
      expect(result.success).toBe(true)
    })

    it('accepts status + message together', () => {
      const result = updateIncidentSchema.safeParse({
        status: 'resolved',
        message: 'The issue has been resolved.',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('resolved')
        expect(result.data.message).toBe('The issue has been resolved.')
      }
    })

    it('accepts title + impact together', () => {
      const result = updateIncidentSchema.safeParse({
        title: 'Downgraded incident',
        impact: 'minor',
      })
      expect(result.success).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe('edge cases', () => {
    it('rejects null payload', () => {
      const result = updateIncidentSchema.safeParse(null)
      expect(result.success).toBe(false)
    })

    it('rejects undefined payload', () => {
      const result = updateIncidentSchema.safeParse(undefined)
      expect(result.success).toBe(false)
    })

    it('rejects a string payload', () => {
      const result = updateIncidentSchema.safeParse('invalid')
      expect(result.success).toBe(false)
    })

    it('strips unknown properties', () => {
      const result = updateIncidentSchema.safeParse({
        title: 'Valid',
        foo: 'bar',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect((result.data as Record<string, unknown>).foo).toBeUndefined()
      }
    })

    it('rejects when a valid field has the wrong type alongside valid fields', () => {
      const result = updateIncidentSchema.safeParse({
        title: 'Valid title',
        status: 12345, // wrong type
      })
      expect(result.success).toBe(false)
    })
  })
})

// ===========================================================================
// Integration test descriptions (commented out)
//
// These tests require a running Nuxt server, database, and authenticated
// session. They should be implemented when an integration test harness
// (e.g. @nuxt/test-utils with setupServer or a dedicated test database)
// is available.
// ===========================================================================

// describe('GET /api/incidents', () => {
//   // Auth
//   it.todo('returns 401 when not authenticated')
//
//   // Listing
//   it.todo('returns an empty array when the user has no incidents')
//   it.todo('returns all incidents belonging to the authenticated user')
//   it.todo('does not return incidents belonging to other users')
//   it.todo('returns incidents ordered by createdAt descending')
//   it.todo('includes statusPageTitle in each incident')
//   it.todo('includes affectedMonitors array in each incident')
//   it.todo('serializes createdAt, updatedAt, resolvedAt as ISO strings')
//
//   // Filtering
//   it.todo('filters incidents by statusPageId query parameter')
//   it.todo('returns empty array when filtering by non-existent statusPageId')
// })

// describe('POST /api/incidents', () => {
//   // Auth
//   it.todo('returns 401 when not authenticated')
//
//   // Validation
//   it.todo('returns 400 when body fails createIncidentSchema validation')
//   it.todo('returns 400 when required fields are missing')
//
//   // Ownership
//   it.todo('returns 404 when statusPageId does not belong to the user')
//   it.todo('returns 404 when statusPageId does not exist')
//
//   // Creation
//   it.todo('creates an incident and returns the created record')
//   it.todo('creates an initial incidentUpdate entry with the provided message')
//   it.todo('sets resolvedAt when status is "resolved"')
//   it.todo('does not set resolvedAt when status is not "resolved"')
//
//   // Monitor linking
//   it.todo('links provided monitorIds to the incident via incidentMonitors')
//   it.todo('only links monitors that belong to the authenticated user')
//   it.todo('ignores monitorIds that do not belong to the user')
//   it.todo('does not create incidentMonitors when monitorIds is empty')
// })

// describe('GET /api/incidents/:id', () => {
//   // Auth
//   it.todo('returns 401 when not authenticated')
//
//   // Not found / ownership
//   it.todo('returns 404 when incident does not exist')
//   it.todo('returns 404 when incident belongs to another user')
//
//   // Response shape
//   it.todo('returns the incident with all fields')
//   it.todo('includes updates array ordered by createdAt descending')
//   it.todo('includes affectedMonitors array with id and name')
//   it.todo('serializes createdAt, updatedAt, resolvedAt as ISO strings')
//   it.todo('returns resolvedAt as null when the incident is not resolved')
// })

// describe('PUT /api/incidents/:id', () => {
//   // Auth
//   it.todo('returns 401 when not authenticated')
//
//   // Not found / ownership
//   it.todo('returns 404 when incident does not exist')
//   it.todo('returns 404 when incident belongs to another user')
//
//   // Validation
//   it.todo('returns 400 when body fails updateIncidentSchema validation')
//
//   // Updating
//   it.todo('updates the incident title when provided')
//   it.todo('updates the incident impact when provided')
//   it.todo('updates the incident status when provided')
//   it.todo('does not overwrite fields that are not provided')
//   it.todo('always updates the updatedAt timestamp')
//
//   // Status change side-effects
//   it.todo('creates an incidentUpdate when status changes')
//   it.todo('uses provided message in incidentUpdate when status changes')
//   it.todo('generates default message when status changes without a message')
//   it.todo('does not create an incidentUpdate when status does not change')
//   it.todo('sets resolvedAt when status changes to "resolved"')
//   it.todo('does not clear resolvedAt when status changes away from "resolved"')
//
//   // Response
//   it.todo('returns the updated incident with ISO-serialized timestamps')
// })

// describe('DELETE /api/incidents/:id', () => {
//   // Auth
//   it.todo('returns 401 when not authenticated')
//
//   // Not found / ownership
//   it.todo('returns 404 when incident does not exist')
//   it.todo('returns 404 when incident belongs to another user')
//
//   // Deletion
//   it.todo('deletes the incident and returns { success: true }')
//   it.todo('cascade-deletes related incidentUpdates')
//   it.todo('cascade-deletes related incidentMonitors')
//   it.todo('does not affect other incidents or data')
// })
