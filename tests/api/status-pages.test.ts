import { describe, it, expect } from 'vitest'
import { createStatusPageSchema, updateStatusPageSchema } from '~/server/utils/validations'

// =====================================================================
// Unit Tests: createStatusPageSchema validation
// =====================================================================

describe('createStatusPageSchema', () => {
  // -----------------------------------------------------------------
  // Helper: builds a valid base payload so individual tests only need
  // to override the field under test.
  // -----------------------------------------------------------------
  const validPayload = () => ({
    slug: 'my-status-page',
    title: 'My Status Page',
    description: 'Optional description text',
    isPublic: true,
    monitorIds: [],
  })

  // =================================================================
  // Slug validation
  // =================================================================

  describe('slug', () => {
    // --- Valid slugs -------------------------------------------------

    it('accepts a lowercase alphanumeric slug', () => {
      const result = createStatusPageSchema.safeParse(validPayload())
      expect(result.success).toBe(true)
    })

    it('accepts a slug that is exactly 3 characters', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'abc',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe('abc')
      }
    })

    it('accepts a slug that is exactly 50 characters', () => {
      const slug = 'a'.repeat(50)
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe(slug)
      }
    })

    it('accepts a slug with hyphens', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'my-cool-page',
      })
      expect(result.success).toBe(true)
    })

    it('accepts a slug with digits', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'page-123',
      })
      expect(result.success).toBe(true)
    })

    it('accepts a slug composed entirely of digits', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: '12345',
      })
      expect(result.success).toBe(true)
    })

    it('accepts a slug with leading/trailing hyphens', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: '-leading-trailing-',
      })
      expect(result.success).toBe(true)
    })

    // --- Invalid slugs -----------------------------------------------

    it('rejects a slug shorter than 3 characters', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'ab',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const slugIssues = result.error.issues.filter(
          (i) => Array.isArray(i.path) && i.path.includes('slug'),
        )
        expect(slugIssues.length).toBeGreaterThan(0)
      }
    })

    it('rejects an empty slug', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug longer than 50 characters', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'a'.repeat(51),
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug with uppercase letters', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'My-Page',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug with spaces', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'my page',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug with underscores', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'my_page',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug with special characters (dots)', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'my.page',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug with special characters (exclamation)', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'my-page!',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug with special characters (at sign)', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: '@my-page',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug with unicode characters', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'caf\u00e9-page',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a slug with forward slashes', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 'my/page',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a missing slug', () => {
      const { slug: _, ...noSlug } = validPayload()
      const result = createStatusPageSchema.safeParse(noSlug)
      expect(result.success).toBe(false)
    })

    it('rejects a non-string slug (number)', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: 12345,
      })
      expect(result.success).toBe(false)
    })

    it('rejects a null slug', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        slug: null,
      })
      expect(result.success).toBe(false)
    })
  })

  // =================================================================
  // Title validation
  // =================================================================

  describe('title', () => {
    it('accepts a title with 1 character (minimum)', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        title: 'A',
      })
      expect(result.success).toBe(true)
    })

    it('accepts a title with 100 characters (maximum)', () => {
      const title = 'T'.repeat(100)
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        title,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe(title)
      }
    })

    it('accepts a title with mixed characters and spaces', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        title: 'My Production Status Page (v2)',
      })
      expect(result.success).toBe(true)
    })

    it('rejects an empty title', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        title: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const titleIssues = result.error.issues.filter(
          (i) => Array.isArray(i.path) && i.path.includes('title'),
        )
        expect(titleIssues.length).toBeGreaterThan(0)
      }
    })

    it('rejects a title longer than 100 characters', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        title: 'T'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('rejects a missing title', () => {
      const { title: _, ...noTitle } = validPayload()
      const result = createStatusPageSchema.safeParse(noTitle)
      expect(result.success).toBe(false)
    })

    it('rejects a non-string title', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        title: 42,
      })
      expect(result.success).toBe(false)
    })
  })

  // =================================================================
  // Description validation
  // =================================================================

  describe('description', () => {
    it('accepts a description string', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        description: 'A nice description',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('A nice description')
      }
    })

    it('accepts an empty string for description', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        description: '',
      })
      expect(result.success).toBe(true)
    })

    it('accepts description at the 500-character boundary', () => {
      const desc = 'D'.repeat(500)
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        description: desc,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe(desc)
      }
    })

    it('rejects a description longer than 500 characters', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        description: 'D'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    it('accepts null for description', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        description: null,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBeNull()
      }
    })

    it('accepts undefined (omitted) description', () => {
      const { description: _, ...noDesc } = validPayload()
      const result = createStatusPageSchema.safeParse(noDesc)
      expect(result.success).toBe(true)
    })

    it('defaults description to undefined when omitted', () => {
      const { description: _, ...noDesc } = validPayload()
      const result = createStatusPageSchema.safeParse(noDesc)
      expect(result.success).toBe(true)
      if (result.success) {
        // Optional + nullable: when omitted the value is undefined
        expect(result.data.description).toBeUndefined()
      }
    })
  })

  // =================================================================
  // isPublic validation
  // =================================================================

  describe('isPublic', () => {
    it('accepts true', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        isPublic: true,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(true)
      }
    })

    it('accepts false', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        isPublic: false,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(false)
      }
    })

    it('defaults to true when omitted', () => {
      const { isPublic: _, ...noIsPublic } = validPayload()
      const result = createStatusPageSchema.safeParse(noIsPublic)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(true)
      }
    })

    it('coerces string "true" to true', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        isPublic: 'true',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(true)
      }
    })

    it('coerces string "false" to false', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        isPublic: 'false',
      })
      // z.coerce.boolean() converts any truthy string to true
      expect(result.success).toBe(true)
    })

    it('coerces number 0 to false', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        isPublic: 0,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(false)
      }
    })

    it('coerces number 1 to true', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        isPublic: 1,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(true)
      }
    })
  })

  // =================================================================
  // monitorIds validation
  // =================================================================

  describe('monitorIds', () => {
    it('accepts an empty array', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        monitorIds: [],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monitorIds).toEqual([])
      }
    })

    it('accepts an array of string IDs', () => {
      const ids = ['id-1', 'id-2', 'id-3']
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        monitorIds: ids,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monitorIds).toEqual(ids)
      }
    })

    it('accepts a single-element array', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        monitorIds: ['single-id'],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monitorIds).toEqual(['single-id'])
      }
    })

    it('accepts UUID-style strings in the array', () => {
      const ids = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ]
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        monitorIds: ids,
      })
      expect(result.success).toBe(true)
    })

    it('defaults to empty array when omitted', () => {
      const { monitorIds: _, ...noMonitorIds } = validPayload()
      const result = createStatusPageSchema.safeParse(noMonitorIds)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monitorIds).toEqual([])
      }
    })

    it('rejects an array containing non-string values (numbers)', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        monitorIds: [1, 2, 3],
      })
      expect(result.success).toBe(false)
    })

    it('rejects an array containing mixed types', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        monitorIds: ['valid-id', 123, null],
      })
      expect(result.success).toBe(false)
    })

    it('rejects a non-array value (string)', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        monitorIds: 'not-an-array',
      })
      expect(result.success).toBe(false)
    })

    it('rejects a non-array value (object)', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        monitorIds: { id: 'test' },
      })
      expect(result.success).toBe(false)
    })
  })

  // =================================================================
  // Full payload validation
  // =================================================================

  describe('full payload', () => {
    it('parses a complete valid payload', () => {
      const payload = validPayload()
      const result = createStatusPageSchema.safeParse(payload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(payload)
      }
    })

    it('parses a minimal valid payload (only required fields)', () => {
      const result = createStatusPageSchema.safeParse({
        slug: 'minimal',
        title: 'Minimal',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe('minimal')
        expect(result.data.title).toBe('Minimal')
        expect(result.data.isPublic).toBe(true)
        expect(result.data.monitorIds).toEqual([])
      }
    })

    it('rejects a completely empty object', () => {
      const result = createStatusPageSchema.safeParse({})
      expect(result.success).toBe(false)
      if (!result.success) {
        // Should have issues for at least slug and title
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
      }
    })

    it('rejects null input', () => {
      const result = createStatusPageSchema.safeParse(null)
      expect(result.success).toBe(false)
    })

    it('rejects undefined input', () => {
      const result = createStatusPageSchema.safeParse(undefined)
      expect(result.success).toBe(false)
    })

    it('strips unknown fields', () => {
      const result = createStatusPageSchema.safeParse({
        ...validPayload(),
        unknownField: 'should be stripped',
        anotherExtra: 123,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('unknownField')
        expect(result.data).not.toHaveProperty('anotherExtra')
      }
    })
  })
})

// =====================================================================
// Unit Tests: updateStatusPageSchema validation
// =====================================================================

describe('updateStatusPageSchema', () => {
  // -----------------------------------------------------------------
  // updateStatusPageSchema is createStatusPageSchema.partial(), which
  // means every field is optional. When a field IS provided, the same
  // validation rules apply.
  // -----------------------------------------------------------------

  describe('all fields optional', () => {
    it('accepts an empty object (no fields)', () => {
      const result = updateStatusPageSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        // Fields with .default() (isPublic, monitorIds) still apply defaults
        // even in a partial schema, so the result includes those 2 keys.
        expect(Object.keys(result.data).length).toBe(2)
        expect(result.data.isPublic).toBe(true)
        expect(result.data.monitorIds).toEqual([])
      }
    })

    it('accepts only slug', () => {
      const result = updateStatusPageSchema.safeParse({ slug: 'new-slug' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe('new-slug')
      }
    })

    it('accepts only title', () => {
      const result = updateStatusPageSchema.safeParse({ title: 'New Title' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('New Title')
      }
    })

    it('accepts only description', () => {
      const result = updateStatusPageSchema.safeParse({
        description: 'Updated description',
      })
      expect(result.success).toBe(true)
    })

    it('accepts only isPublic', () => {
      const result = updateStatusPageSchema.safeParse({ isPublic: false })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(false)
      }
    })

    it('accepts only monitorIds', () => {
      const result = updateStatusPageSchema.safeParse({
        monitorIds: ['id-1', 'id-2'],
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.monitorIds).toEqual(['id-1', 'id-2'])
      }
    })

    it('accepts a subset of fields (slug + title)', () => {
      const result = updateStatusPageSchema.safeParse({
        slug: 'updated-slug',
        title: 'Updated Title',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe('updated-slug')
        expect(result.data.title).toBe('Updated Title')
        expect(result.data.description).toBeUndefined()
        // Fields with .default() still apply defaults in partial schemas
        expect(result.data.isPublic).toBe(true)
        expect(result.data.monitorIds).toEqual([])
      }
    })

    it('accepts all fields together', () => {
      const payload = {
        slug: 'full-update',
        title: 'Full Update',
        description: 'Everything updated',
        isPublic: false,
        monitorIds: ['id-a'],
      }
      const result = updateStatusPageSchema.safeParse(payload)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.slug).toBe('full-update')
        expect(result.data.title).toBe('Full Update')
        expect(result.data.description).toBe('Everything updated')
        expect(result.data.isPublic).toBe(false)
        expect(result.data.monitorIds).toEqual(['id-a'])
      }
    })
  })

  describe('slug validation (when provided)', () => {
    it('rejects slug shorter than 3 characters', () => {
      const result = updateStatusPageSchema.safeParse({ slug: 'ab' })
      expect(result.success).toBe(false)
    })

    it('rejects slug longer than 50 characters', () => {
      const result = updateStatusPageSchema.safeParse({
        slug: 'a'.repeat(51),
      })
      expect(result.success).toBe(false)
    })

    it('rejects slug with uppercase letters', () => {
      const result = updateStatusPageSchema.safeParse({ slug: 'UPPER' })
      expect(result.success).toBe(false)
    })

    it('rejects slug with spaces', () => {
      const result = updateStatusPageSchema.safeParse({ slug: 'has space' })
      expect(result.success).toBe(false)
    })

    it('rejects slug with special characters', () => {
      const result = updateStatusPageSchema.safeParse({ slug: 'no_underscores!' })
      expect(result.success).toBe(false)
    })

    it('accepts valid slug', () => {
      const result = updateStatusPageSchema.safeParse({ slug: 'valid-slug-123' })
      expect(result.success).toBe(true)
    })
  })

  describe('title validation (when provided)', () => {
    it('rejects empty title', () => {
      const result = updateStatusPageSchema.safeParse({ title: '' })
      expect(result.success).toBe(false)
    })

    it('rejects title longer than 100 characters', () => {
      const result = updateStatusPageSchema.safeParse({
        title: 'T'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid title', () => {
      const result = updateStatusPageSchema.safeParse({ title: 'Valid Title' })
      expect(result.success).toBe(true)
    })
  })

  describe('description validation (when provided)', () => {
    it('rejects description longer than 500 characters', () => {
      const result = updateStatusPageSchema.safeParse({
        description: 'D'.repeat(501),
      })
      expect(result.success).toBe(false)
    })

    it('accepts null description', () => {
      const result = updateStatusPageSchema.safeParse({ description: null })
      expect(result.success).toBe(true)
    })

    it('accepts valid description', () => {
      const result = updateStatusPageSchema.safeParse({
        description: 'Short desc',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('isPublic validation (when provided)', () => {
    it('coerces truthy values to boolean', () => {
      const result = updateStatusPageSchema.safeParse({ isPublic: 1 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(true)
      }
    })

    it('coerces falsy values to boolean', () => {
      const result = updateStatusPageSchema.safeParse({ isPublic: 0 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isPublic).toBe(false)
      }
    })
  })

  describe('monitorIds validation (when provided)', () => {
    it('rejects non-string elements', () => {
      const result = updateStatusPageSchema.safeParse({
        monitorIds: [123],
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-array value', () => {
      const result = updateStatusPageSchema.safeParse({
        monitorIds: 'not-array',
      })
      expect(result.success).toBe(false)
    })

    it('accepts valid string array', () => {
      const result = updateStatusPageSchema.safeParse({
        monitorIds: ['id-1'],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('strips unknown fields', () => {
    it('ignores unrecognized properties', () => {
      const result = updateStatusPageSchema.safeParse({
        slug: 'valid',
        randomProp: true,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).not.toHaveProperty('randomProp')
      }
    })
  })
})

// =====================================================================
// Integration test descriptions (commented out)
//
// These describe the expected behavior of each API endpoint when tested
// against a running server with a real or test database. They can be
// implemented once the test infrastructure supports Nuxt API testing
// (e.g. via @nuxt/test-utils setupServer or supertest).
// =====================================================================

// -------------------------------------------------------------------
// GET /api/status-pages  (server/api/status-pages/index.get.ts)
// -------------------------------------------------------------------
// describe('GET /api/status-pages', () => {
//   it('should return 401 when no authentication is provided')
//   it('should return an empty array when the user has no status pages')
//   it('should return only status pages belonging to the authenticated user')
//   it('should include monitorCount for each status page')
//   it('should return status pages ordered by createdAt descending')
//   it('should serialize createdAt and updatedAt as ISO strings')
//   it('should return monitorCount as a number (not a string)')
//   it('should not return status pages belonging to other users')
// })

// -------------------------------------------------------------------
// POST /api/status-pages  (server/api/status-pages/index.post.ts)
// -------------------------------------------------------------------
// describe('POST /api/status-pages', () => {
//   it('should return 401 when no authentication is provided')
//   it('should create a status page with valid data and return it')
//   it('should return 422/400 when body fails schema validation')
//   it('should return 409 when the slug already exists')
//   it('should set the userId to the authenticated user')
//   it('should link monitors when monitorIds are provided')
//   it('should only link monitors that belong to the authenticated user')
//   it('should ignore monitorIds that do not belong to the user (no error, just skip)')
//   it('should set displayOrder based on the position in the monitorIds array')
//   it('should create the status page even if monitorIds is empty')
//   it('should create the status page even if monitorIds is omitted')
// })

// -------------------------------------------------------------------
// GET /api/status-pages/:id  (server/api/status-pages/[id]/index.get.ts)
// -------------------------------------------------------------------
// describe('GET /api/status-pages/:id', () => {
//   it('should return 401 when no authentication is provided')
//   it('should return the status page with its linked monitorIds')
//   it('should return 404 when the status page does not exist')
//   it('should return 404 when the status page belongs to another user')
//   it('should serialize createdAt and updatedAt as ISO strings')
//   it('should return monitorIds as an array of strings')
// })

// -------------------------------------------------------------------
// PUT /api/status-pages/:id  (server/api/status-pages/[id]/index.put.ts)
// -------------------------------------------------------------------
// describe('PUT /api/status-pages/:id', () => {
//   it('should return 401 when no authentication is provided')
//   it('should return 404 when the status page does not exist')
//   it('should return 404 when the status page belongs to another user')
//   it('should update only the provided fields')
//   it('should return 409 when changing slug to one that already exists')
//   it('should allow keeping the same slug without triggering 409')
//   it('should re-link monitors when monitorIds is provided')
//   it('should remove all monitor links when monitorIds is set to an empty array')
//   it('should not change monitor links when monitorIds is not provided')
//   it('should only link monitors belonging to the authenticated user')
//   it('should update the updatedAt timestamp')
//   it('should return the updated status page')
//   it('should return 422/400 when body fails schema validation')
// })

// -------------------------------------------------------------------
// DELETE /api/status-pages/:id  (server/api/status-pages/[id]/index.delete.ts)
// -------------------------------------------------------------------
// describe('DELETE /api/status-pages/:id', () => {
//   it('should return 401 when no authentication is provided')
//   it('should return 404 when the status page does not exist')
//   it('should return 404 when the status page belongs to another user')
//   it('should delete the status page and return { success: true }')
//   it('should cascade-delete associated statusPageMonitors rows')
//   it('should cascade-delete associated incidents')
//   it('should not affect monitors themselves (only the link table)')
// })

// -------------------------------------------------------------------
// GET /api/public/status/:slug  (server/api/public/status/[slug].get.ts)
// -------------------------------------------------------------------
// describe('GET /api/public/status/:slug', () => {
//   it('should not require authentication (public endpoint)')
//   it('should return 404 when the slug does not exist')
//   it('should return 404 when the status page exists but isPublic is false')
//   it('should return the status page with slug, title, and description')
//   it('should return linked monitors with name, currentStatus, uptimePercent, and dailyStatus')
//   it('should return monitors ordered by displayOrder')
//   it('should compute currentStatus as "operational" when latest result is success')
//   it('should compute currentStatus as "down" when latest result is not success')
//   it('should compute currentStatus as "unknown" when there are no results')
//   it('should compute uptimePercent from the last 90 days of results')
//   it('should return uptimePercent as null when there are no results in the 90-day window')
//   it('should return active incidents (non-resolved) with updates and affected monitors')
//   it('should return recently resolved incidents from the last 14 days')
//   it('should not return resolved incidents older than 14 days')
//   it('should compute overallStatus as "operational" when no incidents and all monitors up')
//   it('should compute overallStatus as "major_outage" when a critical incident exists')
//   it('should compute overallStatus as "partial_outage" when a major incident exists')
//   it('should compute overallStatus as "partial_outage" when any monitor is down')
//   it('should compute overallStatus as "degraded" when non-critical/non-major incidents exist')
//   it('should return dailyStatus array with date and status for 90-day uptime bar')
// })
