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
    // Statuspage.io integration
    statuspageApiKey: text('statuspage_api_key'),
    statuspagePageId: text('statuspage_page_id'),
    statuspageComponentId: text('statuspage_component_id'),
    // BetterUptime integration
    betteruptimeHeartbeatUrl: text('betteruptime_heartbeat_url'),
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
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  monitors: many(monitors),
}))

export const monitorsRelations = relations(monitors, ({ one, many }) => ({
  user: one(users, { fields: [monitors.userId], references: [users.id] }),
  results: many(monitorResults),
}))

export const monitorResultsRelations = relations(monitorResults, ({ one }) => ({
  monitor: one(monitors, { fields: [monitorResults.monitorId], references: [monitors.id] }),
}))
