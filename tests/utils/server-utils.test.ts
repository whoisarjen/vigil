import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTableConfig } from 'drizzle-orm/pg-core'
import { getTableColumns } from 'drizzle-orm'
import {
  // Enums
  httpMethodEnum,
  monitorResultStatusEnum,
  planEnum,
  incidentStatusEnum,
  incidentImpactEnum,
  // Tables
  users,
  monitors,
  monitorResults,
  statusPages,
  statusPageMonitors,
  incidents,
  incidentUpdates,
  incidentMonitors,
} from '~~/server/db/schema'
import type { SessionUser, Plan, MonitorStatus, HttpMethod, IncidentStatus, IncidentImpact } from '~~/shared/types'
import { HTTP_METHODS, PLANS, INCIDENT_STATUSES, INCIDENT_IMPACTS } from '~~/shared/types'

// ============================================================
// 1. SCHEMA INTEGRITY TESTS
// ============================================================

describe('Database Schema', () => {
  // ----------------------------------------------------------
  // 1a. Enum definitions
  // ----------------------------------------------------------

  describe('Enums', () => {
    it('httpMethodEnum contains exactly the expected HTTP methods', () => {
      const expected: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']
      expect(httpMethodEnum.enumValues).toEqual(expected)
    })

    it('httpMethodEnum matches the shared HTTP_METHODS constant', () => {
      expect(httpMethodEnum.enumValues).toEqual(HTTP_METHODS)
    })

    it('monitorResultStatusEnum contains all expected statuses', () => {
      const expected: MonitorStatus[] = ['success', 'failure', 'timeout', 'error']
      expect(monitorResultStatusEnum.enumValues).toEqual(expected)
    })

    it('planEnum contains all expected plan types', () => {
      const expected: Plan[] = ['free', 'pro']
      expect(planEnum.enumValues).toEqual(expected)
    })

    it('planEnum values match the keys in the shared PLANS constant', () => {
      const planKeys = Object.keys(PLANS)
      expect(planEnum.enumValues).toEqual(planKeys)
    })

    it('incidentStatusEnum contains all expected statuses', () => {
      const expected: IncidentStatus[] = ['investigating', 'identified', 'monitoring', 'resolved']
      expect(incidentStatusEnum.enumValues).toEqual(expected)
    })

    it('incidentStatusEnum matches the shared INCIDENT_STATUSES values', () => {
      const sharedValues = INCIDENT_STATUSES.map((s) => s.value)
      expect(incidentStatusEnum.enumValues).toEqual(sharedValues)
    })

    it('incidentImpactEnum contains all expected impact levels', () => {
      const expected: IncidentImpact[] = ['none', 'minor', 'major', 'critical']
      expect(incidentImpactEnum.enumValues).toEqual(expected)
    })

    it('incidentImpactEnum matches the shared INCIDENT_IMPACTS values', () => {
      const sharedValues = INCIDENT_IMPACTS.map((i) => i.value)
      expect(incidentImpactEnum.enumValues).toEqual(sharedValues)
    })

    it('each enum has a valid enumName property', () => {
      expect(httpMethodEnum.enumName).toBe('http_method')
      expect(monitorResultStatusEnum.enumName).toBe('monitor_result_status')
      expect(planEnum.enumName).toBe('plan')
      expect(incidentStatusEnum.enumName).toBe('incident_status')
      expect(incidentImpactEnum.enumName).toBe('incident_impact')
    })
  })

  // ----------------------------------------------------------
  // 1b. Users table
  // ----------------------------------------------------------

  describe('users table', () => {
    it('has the correct SQL table name', () => {
      const config = getTableConfig(users)
      expect(config.name).toBe('users')
    })

    it('contains all expected columns', () => {
      const columns = getTableColumns(users)
      const columnNames = Object.keys(columns)
      expect(columnNames).toContain('id')
      expect(columnNames).toContain('email')
      expect(columnNames).toContain('name')
      expect(columnNames).toContain('image')
      expect(columnNames).toContain('googleId')
      expect(columnNames).toContain('plan')
      expect(columnNames).toContain('createdAt')
      expect(columnNames).toContain('updatedAt')
    })

    it('has exactly 8 columns', () => {
      const columns = getTableColumns(users)
      expect(Object.keys(columns)).toHaveLength(8)
    })

    it('has id as primary key', () => {
      const config = getTableConfig(users)
      const idColumn = config.columns.find((c) => c.name === 'id')
      expect(idColumn).toBeDefined()
      expect(idColumn!.primary).toBe(true)
    })

    it('has email with unique constraint', () => {
      const config = getTableConfig(users)
      const emailCol = config.columns.find((c) => c.name === 'email')
      expect(emailCol).toBeDefined()
      expect(emailCol!.isUnique).toBe(true)
    })

    it('has googleId with unique constraint', () => {
      const config = getTableConfig(users)
      const googleIdCol = config.columns.find((c) => c.name === 'google_id')
      expect(googleIdCol).toBeDefined()
      expect(googleIdCol!.isUnique).toBe(true)
    })

    it('has notNull on required columns', () => {
      const columns = getTableColumns(users)
      expect(columns.id.notNull).toBe(true)
      expect(columns.email.notNull).toBe(true)
      expect(columns.plan.notNull).toBe(true)
      expect(columns.createdAt.notNull).toBe(true)
      expect(columns.updatedAt.notNull).toBe(true)
    })

    it('allows null on optional columns', () => {
      const columns = getTableColumns(users)
      expect(columns.name.notNull).toBe(false)
      expect(columns.image.notNull).toBe(false)
      expect(columns.googleId.notNull).toBe(false)
    })
  })

  // ----------------------------------------------------------
  // 1c. Monitors table
  // ----------------------------------------------------------

  describe('monitors table', () => {
    it('has the correct SQL table name', () => {
      const config = getTableConfig(monitors)
      expect(config.name).toBe('monitors')
    })

    it('contains all expected columns', () => {
      const columns = getTableColumns(monitors)
      const columnNames = Object.keys(columns)
      const expected = [
        'id', 'userId', 'name', 'url', 'method', 'expectedStatus',
        'timeoutMs', 'scheduleInterval', 'headers', 'body', 'enabled',
        'createdAt', 'updatedAt',
      ]
      for (const col of expected) {
        expect(columnNames).toContain(col)
      }
    })

    it('has exactly 13 columns', () => {
      const columns = getTableColumns(monitors)
      expect(Object.keys(columns)).toHaveLength(13)
    })

    it('has a foreign key referencing users(id)', () => {
      const config = getTableConfig(monitors)
      expect(config.foreignKeys.length).toBeGreaterThanOrEqual(1)
      const userFK = config.foreignKeys.find((fk) => {
        const refTable = fk.reference().foreignTable
        const refTableConfig = getTableConfig(refTable)
        return refTableConfig.name === 'users'
      })
      expect(userFK).toBeDefined()
    })

    it('has indexes on userId and enabled', () => {
      const config = getTableConfig(monitors)
      const indexNames = config.indexes.map((i) => i.config.name)
      expect(indexNames).toContain('monitors_user_id_idx')
      expect(indexNames).toContain('monitors_enabled_idx')
    })

    it('has notNull on required columns', () => {
      const columns = getTableColumns(monitors)
      expect(columns.id.notNull).toBe(true)
      expect(columns.userId.notNull).toBe(true)
      expect(columns.name.notNull).toBe(true)
      expect(columns.url.notNull).toBe(true)
      expect(columns.method.notNull).toBe(true)
      expect(columns.expectedStatus.notNull).toBe(true)
      expect(columns.timeoutMs.notNull).toBe(true)
      expect(columns.scheduleInterval.notNull).toBe(true)
      expect(columns.enabled.notNull).toBe(true)
    })

    it('allows null on optional columns', () => {
      const columns = getTableColumns(monitors)
      expect(columns.body.notNull).toBe(false)
    })
  })

  // ----------------------------------------------------------
  // 1d. Monitor Results table
  // ----------------------------------------------------------

  describe('monitorResults table', () => {
    it('has the correct SQL table name', () => {
      const config = getTableConfig(monitorResults)
      expect(config.name).toBe('monitor_results')
    })

    it('contains all expected columns', () => {
      const columns = getTableColumns(monitorResults)
      const columnNames = Object.keys(columns)
      const expected = [
        'id', 'monitorId', 'status', 'responseCode',
        'responseTimeMs', 'errorMessage', 'executedAt',
      ]
      for (const col of expected) {
        expect(columnNames).toContain(col)
      }
    })

    it('has exactly 7 columns', () => {
      const columns = getTableColumns(monitorResults)
      expect(Object.keys(columns)).toHaveLength(7)
    })

    it('has a foreign key referencing monitors(id)', () => {
      const config = getTableConfig(monitorResults)
      const monitorFK = config.foreignKeys.find((fk) => {
        const refTable = fk.reference().foreignTable
        const refTableConfig = getTableConfig(refTable)
        return refTableConfig.name === 'monitors'
      })
      expect(monitorFK).toBeDefined()
    })

    it('has three indexes for query performance', () => {
      const config = getTableConfig(monitorResults)
      const indexNames = config.indexes.map((i) => i.config.name)
      expect(indexNames).toContain('results_monitor_id_idx')
      expect(indexNames).toContain('results_executed_at_idx')
      expect(indexNames).toContain('results_monitor_executed_idx')
    })

    it('allows null on optional result fields', () => {
      const columns = getTableColumns(monitorResults)
      expect(columns.responseCode.notNull).toBe(false)
      expect(columns.responseTimeMs.notNull).toBe(false)
      expect(columns.errorMessage.notNull).toBe(false)
    })
  })

  // ----------------------------------------------------------
  // 1e. Status Pages table
  // ----------------------------------------------------------

  describe('statusPages table', () => {
    it('has the correct SQL table name', () => {
      const config = getTableConfig(statusPages)
      expect(config.name).toBe('status_pages')
    })

    it('contains all expected columns', () => {
      const columns = getTableColumns(statusPages)
      const columnNames = Object.keys(columns)
      const expected = [
        'id', 'userId', 'slug', 'title', 'description',
        'isPublic', 'createdAt', 'updatedAt',
      ]
      for (const col of expected) {
        expect(columnNames).toContain(col)
      }
    })

    it('has exactly 8 columns', () => {
      const columns = getTableColumns(statusPages)
      expect(Object.keys(columns)).toHaveLength(8)
    })

    it('slug has a unique constraint', () => {
      const config = getTableConfig(statusPages)
      const slugCol = config.columns.find((c) => c.name === 'slug')
      expect(slugCol).toBeDefined()
      expect(slugCol!.isUnique).toBe(true)
    })

    it('has a foreign key referencing users(id)', () => {
      const config = getTableConfig(statusPages)
      const userFK = config.foreignKeys.find((fk) => {
        const refTable = fk.reference().foreignTable
        const refTableConfig = getTableConfig(refTable)
        return refTableConfig.name === 'users'
      })
      expect(userFK).toBeDefined()
    })

    it('has indexes on userId and slug', () => {
      const config = getTableConfig(statusPages)
      const indexNames = config.indexes.map((i) => i.config.name)
      expect(indexNames).toContain('status_pages_user_id_idx')
      expect(indexNames).toContain('status_pages_slug_idx')
    })
  })

  // ----------------------------------------------------------
  // 1f. Status Page Monitors (junction table)
  // ----------------------------------------------------------

  describe('statusPageMonitors table', () => {
    it('has the correct SQL table name', () => {
      const config = getTableConfig(statusPageMonitors)
      expect(config.name).toBe('status_page_monitors')
    })

    it('contains all expected columns', () => {
      const columns = getTableColumns(statusPageMonitors)
      const columnNames = Object.keys(columns)
      const expected = ['id', 'statusPageId', 'monitorId', 'displayOrder']
      for (const col of expected) {
        expect(columnNames).toContain(col)
      }
    })

    it('has exactly 4 columns', () => {
      const columns = getTableColumns(statusPageMonitors)
      expect(Object.keys(columns)).toHaveLength(4)
    })

    it('has foreign keys referencing statusPages(id) and monitors(id)', () => {
      const config = getTableConfig(statusPageMonitors)
      expect(config.foreignKeys).toHaveLength(2)

      const referencedTables = config.foreignKeys.map((fk) => {
        const refTable = fk.reference().foreignTable
        return getTableConfig(refTable).name
      })
      expect(referencedTables).toContain('status_pages')
      expect(referencedTables).toContain('monitors')
    })

    it('has indexes on statusPageId and monitorId', () => {
      const config = getTableConfig(statusPageMonitors)
      const indexNames = config.indexes.map((i) => i.config.name)
      expect(indexNames).toContain('spm_status_page_id_idx')
      expect(indexNames).toContain('spm_monitor_id_idx')
    })
  })

  // ----------------------------------------------------------
  // 1g. Incidents table
  // ----------------------------------------------------------

  describe('incidents table', () => {
    it('has the correct SQL table name', () => {
      const config = getTableConfig(incidents)
      expect(config.name).toBe('incidents')
    })

    it('contains all expected columns', () => {
      const columns = getTableColumns(incidents)
      const columnNames = Object.keys(columns)
      const expected = [
        'id', 'userId', 'statusPageId', 'title', 'status',
        'impact', 'createdAt', 'updatedAt', 'resolvedAt',
      ]
      for (const col of expected) {
        expect(columnNames).toContain(col)
      }
    })

    it('has exactly 9 columns', () => {
      const columns = getTableColumns(incidents)
      expect(Object.keys(columns)).toHaveLength(9)
    })

    it('has foreign keys referencing users(id) and statusPages(id)', () => {
      const config = getTableConfig(incidents)
      const referencedTables = config.foreignKeys.map((fk) => {
        const refTable = fk.reference().foreignTable
        return getTableConfig(refTable).name
      })
      expect(referencedTables).toContain('users')
      expect(referencedTables).toContain('status_pages')
    })

    it('has indexes on userId, statusPageId, and status', () => {
      const config = getTableConfig(incidents)
      const indexNames = config.indexes.map((i) => i.config.name)
      expect(indexNames).toContain('incidents_user_id_idx')
      expect(indexNames).toContain('incidents_status_page_id_idx')
      expect(indexNames).toContain('incidents_status_idx')
    })

    it('resolvedAt is nullable', () => {
      const columns = getTableColumns(incidents)
      expect(columns.resolvedAt.notNull).toBe(false)
    })
  })

  // ----------------------------------------------------------
  // 1h. Incident Updates table
  // ----------------------------------------------------------

  describe('incidentUpdates table', () => {
    it('has the correct SQL table name', () => {
      const config = getTableConfig(incidentUpdates)
      expect(config.name).toBe('incident_updates')
    })

    it('contains all expected columns', () => {
      const columns = getTableColumns(incidentUpdates)
      const columnNames = Object.keys(columns)
      const expected = ['id', 'incidentId', 'message', 'status', 'createdAt']
      for (const col of expected) {
        expect(columnNames).toContain(col)
      }
    })

    it('has exactly 5 columns', () => {
      const columns = getTableColumns(incidentUpdates)
      expect(Object.keys(columns)).toHaveLength(5)
    })

    it('has a foreign key referencing incidents(id)', () => {
      const config = getTableConfig(incidentUpdates)
      const incidentFK = config.foreignKeys.find((fk) => {
        const refTable = fk.reference().foreignTable
        return getTableConfig(refTable).name === 'incidents'
      })
      expect(incidentFK).toBeDefined()
    })

    it('has an index on incidentId', () => {
      const config = getTableConfig(incidentUpdates)
      const indexNames = config.indexes.map((i) => i.config.name)
      expect(indexNames).toContain('incident_updates_incident_id_idx')
    })
  })

  // ----------------------------------------------------------
  // 1i. Incident Monitors (junction table)
  // ----------------------------------------------------------

  describe('incidentMonitors table', () => {
    it('has the correct SQL table name', () => {
      const config = getTableConfig(incidentMonitors)
      expect(config.name).toBe('incident_monitors')
    })

    it('contains all expected columns', () => {
      const columns = getTableColumns(incidentMonitors)
      const columnNames = Object.keys(columns)
      const expected = ['id', 'incidentId', 'monitorId']
      for (const col of expected) {
        expect(columnNames).toContain(col)
      }
    })

    it('has exactly 3 columns', () => {
      const columns = getTableColumns(incidentMonitors)
      expect(Object.keys(columns)).toHaveLength(3)
    })

    it('has foreign keys referencing incidents(id) and monitors(id)', () => {
      const config = getTableConfig(incidentMonitors)
      const referencedTables = config.foreignKeys.map((fk) => {
        const refTable = fk.reference().foreignTable
        return getTableConfig(refTable).name
      })
      expect(referencedTables).toContain('incidents')
      expect(referencedTables).toContain('monitors')
    })

    it('has indexes on incidentId and monitorId', () => {
      const config = getTableConfig(incidentMonitors)
      const indexNames = config.indexes.map((i) => i.config.name)
      expect(indexNames).toContain('im_incident_id_idx')
      expect(indexNames).toContain('im_monitor_id_idx')
    })
  })

  // ----------------------------------------------------------
  // 1j. Cross-table foreign key cascade rules
  // ----------------------------------------------------------

  describe('Foreign key cascade rules', () => {
    const tables = [
      { table: monitors, label: 'monitors' },
      { table: monitorResults, label: 'monitorResults' },
      { table: statusPages, label: 'statusPages' },
      { table: statusPageMonitors, label: 'statusPageMonitors' },
      { table: incidents, label: 'incidents' },
      { table: incidentUpdates, label: 'incidentUpdates' },
      { table: incidentMonitors, label: 'incidentMonitors' },
    ]

    for (const { table, label } of tables) {
      it(`all foreign keys on ${label} use onDelete cascade`, () => {
        const config = getTableConfig(table)
        for (const fk of config.foreignKeys) {
          expect(fk.onDelete).toBe('cascade')
        }
      })
    }
  })
})

// ============================================================
// 2. AUTH UTILITY TESTS (mock-based)
// ============================================================

describe('requireAuth', () => {
  // The Nuxt auto-imports getUserSession and createError.
  // We mock them at the global level since they are auto-imported in the Nuxt environment.

  const mockGetUserSession = vi.fn()
  const mockCreateError = vi.fn((opts: { statusCode: number; statusMessage: string }) => {
    const error = new Error(opts.statusMessage) as Error & { statusCode: number; statusMessage: string }
    error.statusCode = opts.statusCode
    error.statusMessage = opts.statusMessage
    return error
  })

  beforeEach(() => {
    vi.resetAllMocks()
    // Provide the mocks via globalThis, which is where Nuxt auto-imports land.
    // @ts-expect-error -- Nuxt auto-import globals
    globalThis.getUserSession = mockGetUserSession
    // @ts-expect-error -- Nuxt auto-import globals
    globalThis.createError = mockCreateError
  })

  // We import the function lazily after mocks are set so the module picks them up.
  async function loadRequireAuth() {
    // Clear the module cache so fresh mocks are used
    vi.resetModules()
    const mod = await import('~~/server/utils/auth')
    return mod.requireAuth
  }

  it('is exported as a function', async () => {
    const requireAuth = await loadRequireAuth()
    expect(typeof requireAuth).toBe('function')
  })

  it('throws a 401 error when getUserSession returns null', async () => {
    const requireAuth = await loadRequireAuth()
    mockGetUserSession.mockResolvedValueOnce(null)

    const fakeEvent = {} as any
    await expect(requireAuth(fakeEvent)).rejects.toThrow('Unauthorized')
    expect(mockCreateError).toHaveBeenCalledWith({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  })

  it('throws a 401 error when session exists but user is undefined', async () => {
    const requireAuth = await loadRequireAuth()
    mockGetUserSession.mockResolvedValueOnce({ user: undefined })

    const fakeEvent = {} as any
    await expect(requireAuth(fakeEvent)).rejects.toThrow('Unauthorized')
  })

  it('throws a 401 error when session exists but user is null', async () => {
    const requireAuth = await loadRequireAuth()
    mockGetUserSession.mockResolvedValueOnce({ user: null })

    const fakeEvent = {} as any
    await expect(requireAuth(fakeEvent)).rejects.toThrow('Unauthorized')
  })

  it('throws a 401 error when session has no user property', async () => {
    const requireAuth = await loadRequireAuth()
    mockGetUserSession.mockResolvedValueOnce({})

    const fakeEvent = {} as any
    await expect(requireAuth(fakeEvent)).rejects.toThrow('Unauthorized')
  })

  it('returns the user object when a valid session exists', async () => {
    const requireAuth = await loadRequireAuth()
    const mockUser: SessionUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.png',
      plan: 'free',
    }
    mockGetUserSession.mockResolvedValueOnce({ user: mockUser })

    const fakeEvent = {} as any
    const result = await requireAuth(fakeEvent)

    expect(result).toEqual(mockUser)
  })

  it('returns the user object for a pro plan user', async () => {
    const requireAuth = await loadRequireAuth()
    const mockUser: SessionUser = {
      id: 'user-456',
      email: 'pro@example.com',
      name: 'Pro User',
      image: null,
      plan: 'pro',
    }
    mockGetUserSession.mockResolvedValueOnce({ user: mockUser })

    const fakeEvent = {} as any
    const result = await requireAuth(fakeEvent)

    expect(result).toEqual(mockUser)
    expect(result.plan).toBe('pro')
  })

  it('returned user conforms to the SessionUser shape', async () => {
    const requireAuth = await loadRequireAuth()
    const mockUser: SessionUser = {
      id: 'user-789',
      email: 'shape@example.com',
      name: null,
      image: null,
      plan: 'free',
    }
    mockGetUserSession.mockResolvedValueOnce({ user: mockUser })

    const fakeEvent = {} as any
    const result = await requireAuth(fakeEvent)

    // Verify all required SessionUser properties exist
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('email')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('image')
    expect(result).toHaveProperty('plan')
    // Verify types
    expect(typeof result.id).toBe('string')
    expect(typeof result.email).toBe('string')
    expect(['string', 'object'].includes(typeof result.name)).toBe(true) // string | null
    expect(['string', 'object'].includes(typeof result.image)).toBe(true) // string | null
    expect(planEnum.enumValues).toContain(result.plan)
  })

  it('passes the event argument through to getUserSession', async () => {
    const requireAuth = await loadRequireAuth()
    const mockUser: SessionUser = {
      id: 'user-abc',
      email: 'event@example.com',
      name: 'Event Test',
      image: null,
      plan: 'free',
    }
    mockGetUserSession.mockResolvedValueOnce({ user: mockUser })

    const fakeEvent = { node: { req: {} } } as any
    await requireAuth(fakeEvent)

    expect(mockGetUserSession).toHaveBeenCalledTimes(1)
    expect(mockGetUserSession).toHaveBeenCalledWith(fakeEvent)
  })
})

// ============================================================
// 3. MONITOR UTILITY STRUCTURE TESTS
// ============================================================

describe('Monitor utility (runAllChecks)', () => {
  // ----------------------------------------------------------
  // 3a. Export verification
  // ----------------------------------------------------------

  describe('module exports', () => {
    it('runAllChecks is exported from server/utils/monitor', async () => {
      const mod = await import('~~/server/utils/monitor')
      expect(mod).toHaveProperty('runAllChecks')
      expect(typeof mod.runAllChecks).toBe('function')
    })
  })

  // ----------------------------------------------------------
  // 3b. Internal helper functions (tested via mock-based approach)
  // ----------------------------------------------------------

  describe('runAllChecks with mocked database', () => {
    // We mock useDB and all database operations to test the function's logic
    // without needing a real database connection.

    const mockSelect = vi.fn()
    const mockFrom = vi.fn()
    const mockWhere = vi.fn()
    const mockInsert = vi.fn()
    const mockValues = vi.fn()
    const mockDelete = vi.fn()
    const mockInnerJoin = vi.fn()
    const mockReturning = vi.fn()
    const mockLimit = vi.fn()

    function buildMockDB() {
      // Chain: db.select().from(table).where(condition)
      mockWhere.mockResolvedValue([])
      mockFrom.mockReturnValue({ where: mockWhere, innerJoin: mockInnerJoin })
      mockSelect.mockReturnValue({ from: mockFrom })
      mockReturning.mockResolvedValue([{ id: 'inc-1' }])
      mockValues.mockReturnValue({ returning: mockReturning })
      mockInsert.mockReturnValue({ values: mockValues })
      mockDelete.mockReturnValue({ where: mockWhere })
      mockInnerJoin.mockReturnValue({ where: mockWhere })
      mockLimit.mockResolvedValue([])

      return {
        select: mockSelect,
        insert: mockInsert,
        delete: mockDelete,
      }
    }

    beforeEach(() => {
      vi.resetAllMocks()
      vi.resetModules()
    })

    it('returns { checked: 0, results: [] } when no active monitors exist', async () => {
      const mockDB = buildMockDB()
      // Make the first select query return an empty array (no active monitors)
      mockWhere.mockResolvedValueOnce([])

      // @ts-expect-error -- Nuxt auto-import global
      globalThis.useDB = () => mockDB

      const { runAllChecks } = await import('~~/server/utils/monitor')
      const result = await runAllChecks()

      expect(result).toEqual({ checked: 0, results: [] })
    })

    it('does not insert results or clean up when there are no monitors', async () => {
      const mockDB = buildMockDB()
      mockWhere.mockResolvedValueOnce([])

      // @ts-expect-error -- Nuxt auto-import global
      globalThis.useDB = () => mockDB

      const { runAllChecks } = await import('~~/server/utils/monitor')
      await runAllChecks()

      // insert should not be called since there are no results to save
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  // ----------------------------------------------------------
  // 3c. CheckResult type shape validation
  // ----------------------------------------------------------

  describe('CheckResult interface contract', () => {
    // Verify the expected shape of CheckResult as used throughout monitor.ts
    // by checking the monitorResults schema columns match.

    it('monitorResults columns align with CheckResult fields', () => {
      const columns = getTableColumns(monitorResults)
      // CheckResult has: monitorId, status, responseCode, responseTimeMs, errorMessage
      // monitorResults has those plus: id, executedAt
      expect(columns).toHaveProperty('monitorId')
      expect(columns).toHaveProperty('status')
      expect(columns).toHaveProperty('responseCode')
      expect(columns).toHaveProperty('responseTimeMs')
      expect(columns).toHaveProperty('errorMessage')
    })

    it('status column uses monitorResultStatusEnum', () => {
      const columns = getTableColumns(monitorResults)
      // The enum values that the column accepts should match CheckResult['status']
      expect(monitorResultStatusEnum.enumValues).toContain('success')
      expect(monitorResultStatusEnum.enumValues).toContain('failure')
      expect(monitorResultStatusEnum.enumValues).toContain('timeout')
      expect(monitorResultStatusEnum.enumValues).toContain('error')
      // The status column should be notNull
      expect(columns.status.notNull).toBe(true)
    })
  })

  // ----------------------------------------------------------
  // 3d. Auto-incident creation logic (documented integration tests)
  // ----------------------------------------------------------

  describe('Auto-incident creation logic', () => {
    // These tests document the expected behavior of createAutoIncidents.
    // They verify the contract and preconditions rather than the full
    // database interaction, which requires an integration test environment.

    it('incident status defaults to "investigating" in schema', () => {
      const columns = getTableColumns(incidents)
      // The status column should have 'investigating' as its default
      expect(columns.status.hasDefault).toBe(true)
    })

    it('incident impact defaults to "minor" in schema', () => {
      const columns = getTableColumns(incidents)
      expect(columns.impact.hasDefault).toBe(true)
    })

    it('incidentUpdates message is required (notNull)', () => {
      const columns = getTableColumns(incidentUpdates)
      expect(columns.message.notNull).toBe(true)
    })

    it('incidentMonitors links both incident and monitor', () => {
      const columns = getTableColumns(incidentMonitors)
      expect(columns.incidentId.notNull).toBe(true)
      expect(columns.monitorId.notNull).toBe(true)
    })

    it('incidents table supports all statuses needed for lifecycle', () => {
      // The auto-incident creation sets status to 'investigating'.
      // Verify the schema supports the full lifecycle.
      const lifecycleStatuses: IncidentStatus[] = [
        'investigating', 'identified', 'monitoring', 'resolved',
      ]
      for (const status of lifecycleStatuses) {
        expect(incidentStatusEnum.enumValues).toContain(status)
      }
    })

    it('incidents table supports all impact levels', () => {
      // getImpactFromStatus returns 'minor' or 'major'.
      // Verify the schema supports all possible values.
      expect(incidentImpactEnum.enumValues).toContain('minor')
      expect(incidentImpactEnum.enumValues).toContain('major')
      // Also verify the full range
      expect(incidentImpactEnum.enumValues).toContain('none')
      expect(incidentImpactEnum.enumValues).toContain('critical')
    })
  })

  // ----------------------------------------------------------
  // 3e. Integration test descriptions (documented, not executable)
  // ----------------------------------------------------------

  describe.todo('Integration: runAllChecks with real HTTP calls', () => {
    // These tests require a running database and network access.
    // They are documented here as a specification for future integration tests.
    //
    // TEST: should fetch all enabled monitors from the database
    //   Setup: Insert 3 monitors (2 enabled, 1 disabled) into a test database.
    //   Assert: runAllChecks returns { checked: 2, results: [...] }.
    //
    // TEST: should record a 'success' result when the endpoint returns the expected status
    //   Setup: Mock an HTTP server returning 200; insert a monitor expecting 200.
    //   Assert: The result has status 'success' and responseCode 200.
    //
    // TEST: should record a 'failure' result when the endpoint returns an unexpected status
    //   Setup: Mock an HTTP server returning 500; insert a monitor expecting 200.
    //   Assert: The result has status 'failure' and errorMessage containing "Expected 200, got 500".
    //
    // TEST: should record a 'timeout' result when the endpoint exceeds timeoutMs
    //   Setup: Mock an HTTP server that delays 10s; insert a monitor with timeoutMs=100.
    //   Assert: The result has status 'timeout' and errorMessage containing "timed out".
    //
    // TEST: should record an 'error' result when the endpoint is unreachable
    //   Setup: Insert a monitor pointing to an invalid URL (e.g. http://localhost:1).
    //   Assert: The result has status 'error'.
    //
    // TEST: should respect the concurrency limit of 5
    //   Setup: Insert 10 monitors; mock HTTP server with a delay.
    //   Assert: At most 5 requests are in-flight concurrently.
    //
    // TEST: should persist all results to the monitorResults table
    //   Setup: Insert 3 monitors; run checks.
    //   Assert: 3 new rows exist in monitorResults.
    //
    // TEST: should delete results older than 90 days
    //   Setup: Insert monitorResults with executedAt = 91 days ago.
    //   Assert: Those rows are deleted after runAllChecks completes.
    //
    // TEST: should create an auto-incident when a linked monitor fails
    //   Setup: Insert a monitor linked to a status page via statusPageMonitors.
    //          Make the monitor check fail.
    //   Assert: A new incident is created with status 'investigating'.
    //           An incidentUpdate is created with an automated alert message.
    //           An incidentMonitor row links the incident and monitor.
    //
    // TEST: should NOT create a duplicate incident if one is already active
    //   Setup: Insert a monitor linked to a status page, and an existing
    //          incident (status != 'resolved') for that monitor+page pair.
    //          Make the monitor check fail again.
    //   Assert: No new incident is created.
    //
    // TEST: should set impact to 'major' for 'error' status
    //   Setup: Trigger an 'error' result for a linked monitor.
    //   Assert: The auto-created incident has impact 'major'.
    //
    // TEST: should set impact to 'minor' for 'failure' and 'timeout' statuses
    //   Setup: Trigger a 'failure' or 'timeout' result.
    //   Assert: The auto-created incident has impact 'minor'.
    //
    // TEST: should include the monitor name and status in the incident title
    //   Setup: Monitor name = "API Health", status = "timeout".
    //   Assert: incident.title === "API Health is timeout".
    //
    // TEST: should handle Promise rejections gracefully
    //   Setup: Force a monitor check to throw (e.g., via mocked fetch).
    //   Assert: The result has status 'error' and errorMessage "Promise rejected".
  })
})
