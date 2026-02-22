import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================
// Enums
// ============================================

export const httpMethodEnum = pgEnum('http_method', [
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD',
])

export const monitorResultStatusEnum = pgEnum('monitor_result_status', [
  'success', 'failure', 'timeout', 'error',
])

export const planEnum = pgEnum('plan', ['free', 'pro'])

export const incidentStatusEnum = pgEnum('incident_status', [
  'investigating', 'identified', 'monitoring', 'resolved',
])

export const incidentImpactEnum = pgEnum('incident_impact', [
  'none', 'minor', 'major', 'critical',
])

// ============================================
// Users
// ============================================

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  name: text('name'),
  image: text('image'),
  googleId: text('google_id').unique(),
  plan: planEnum('plan').default('free').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

// ============================================
// Monitors
// ============================================

export const monitors = pgTable(
  'monitors',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    url: text('url').notNull(),
    method: httpMethodEnum('method').default('GET').notNull(),
    expectedStatus: integer('expected_status').default(200).notNull(),
    timeoutMs: integer('timeout_ms').default(5000).notNull(),
    scheduleInterval: integer('schedule_interval').default(15).notNull(),
    headers: jsonb('headers').$type<Record<string, string>>().default({}),
    body: text('body'),
    enabled: boolean('enabled').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('monitors_user_id_idx').on(table.userId),
    index('monitors_enabled_idx').on(table.enabled),
  ],
)

// ============================================
// Monitor Results
// ============================================

export const monitorResults = pgTable(
  'monitor_results',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    monitorId: text('monitor_id').notNull().references(() => monitors.id, { onDelete: 'cascade' }),
    status: monitorResultStatusEnum('status').notNull(),
    responseCode: integer('response_code'),
    responseTimeMs: integer('response_time_ms'),
    errorMessage: text('error_message'),
    executedAt: timestamp('executed_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('results_monitor_id_idx').on(table.monitorId),
    index('results_executed_at_idx').on(table.executedAt),
    index('results_monitor_executed_idx').on(table.monitorId, table.executedAt),
  ],
)

// ============================================
// Status Pages
// ============================================

export const statusPages = pgTable(
  'status_pages',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').unique().notNull(),
    title: text('title').notNull(),
    description: text('description'),
    isPublic: boolean('is_public').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('status_pages_user_id_idx').on(table.userId),
    index('status_pages_slug_idx').on(table.slug),
  ],
)

export const statusPageMonitors = pgTable(
  'status_page_monitors',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    statusPageId: text('status_page_id').notNull().references(() => statusPages.id, { onDelete: 'cascade' }),
    monitorId: text('monitor_id').notNull().references(() => monitors.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').default(0).notNull(),
  },
  (table) => [
    index('spm_status_page_id_idx').on(table.statusPageId),
    index('spm_monitor_id_idx').on(table.monitorId),
  ],
)

// ============================================
// Incidents
// ============================================

export const incidents = pgTable(
  'incidents',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    statusPageId: text('status_page_id').notNull().references(() => statusPages.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: incidentStatusEnum('status').default('investigating').notNull(),
    impact: incidentImpactEnum('impact').default('minor').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at', { mode: 'date' }),
  },
  (table) => [
    index('incidents_user_id_idx').on(table.userId),
    index('incidents_status_page_id_idx').on(table.statusPageId),
    index('incidents_status_idx').on(table.status),
  ],
)

export const incidentUpdates = pgTable(
  'incident_updates',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    incidentId: text('incident_id').notNull().references(() => incidents.id, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    status: incidentStatusEnum('status').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('incident_updates_incident_id_idx').on(table.incidentId),
  ],
)

export const incidentMonitors = pgTable(
  'incident_monitors',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    incidentId: text('incident_id').notNull().references(() => incidents.id, { onDelete: 'cascade' }),
    monitorId: text('monitor_id').notNull().references(() => monitors.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('im_incident_id_idx').on(table.incidentId),
    index('im_monitor_id_idx').on(table.monitorId),
  ],
)

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  monitors: many(monitors),
  statusPages: many(statusPages),
  incidents: many(incidents),
}))

export const monitorsRelations = relations(monitors, ({ one, many }) => ({
  user: one(users, { fields: [monitors.userId], references: [users.id] }),
  results: many(monitorResults),
  statusPageMonitors: many(statusPageMonitors),
  incidentMonitors: many(incidentMonitors),
}))

export const monitorResultsRelations = relations(monitorResults, ({ one }) => ({
  monitor: one(monitors, { fields: [monitorResults.monitorId], references: [monitors.id] }),
}))

export const statusPagesRelations = relations(statusPages, ({ one, many }) => ({
  user: one(users, { fields: [statusPages.userId], references: [users.id] }),
  statusPageMonitors: many(statusPageMonitors),
  incidents: many(incidents),
}))

export const statusPageMonitorsRelations = relations(statusPageMonitors, ({ one }) => ({
  statusPage: one(statusPages, { fields: [statusPageMonitors.statusPageId], references: [statusPages.id] }),
  monitor: one(monitors, { fields: [statusPageMonitors.monitorId], references: [monitors.id] }),
}))

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  user: one(users, { fields: [incidents.userId], references: [users.id] }),
  statusPage: one(statusPages, { fields: [incidents.statusPageId], references: [statusPages.id] }),
  updates: many(incidentUpdates),
  incidentMonitors: many(incidentMonitors),
}))

export const incidentUpdatesRelations = relations(incidentUpdates, ({ one }) => ({
  incident: one(incidents, { fields: [incidentUpdates.incidentId], references: [incidents.id] }),
}))

export const incidentMonitorsRelations = relations(incidentMonitors, ({ one }) => ({
  incident: one(incidents, { fields: [incidentMonitors.incidentId], references: [incidents.id] }),
  monitor: one(monitors, { fields: [incidentMonitors.monitorId], references: [monitors.id] }),
}))
