<template>
  <div class="min-h-screen bg-background bg-dot-pattern">
    <!-- Loading -->
    <div v-if="status === 'pending'" class="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div class="text-center space-y-4 animate-pulse">
        <div class="h-8 w-48 mx-auto rounded bg-surface-raised" />
        <div class="h-4 w-64 mx-auto rounded bg-surface-raised" />
      </div>
      <div class="h-16 rounded-[var(--radius-lg)] bg-surface-raised animate-pulse" />
      <div class="space-y-3">
        <div v-for="n in 4" :key="n" class="h-20 rounded-[var(--radius-lg)] bg-surface-raised animate-pulse" />
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="fetchError" class="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div class="glass-card p-16 text-center space-y-4" style="transform: none">
        <div class="w-16 h-16 mx-auto rounded-full bg-danger-muted flex items-center justify-center">
          <AlertCircle class="w-8 h-8 text-danger" />
        </div>
        <h1 class="text-2xl font-bold text-foreground">Status Page Not Found</h1>
        <p class="text-foreground-muted">This status page doesn't exist or is no longer available.</p>
        <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm text-accent-light hover:underline mt-4">
          <ArrowLeft class="w-4 h-4" />
          Go home
        </NuxtLink>
      </div>
    </div>

    <!-- Status Page -->
    <div v-else-if="pageData" class="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">

      <!-- Header -->
      <div class="text-center space-y-3 animate-fade-in">
        <div class="inline-flex items-center gap-2.5 mb-2">
          <div class="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 32 32" class="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="vigil-pub" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#6366f1" />
                  <stop offset="1" stop-color="#a855f7" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#vigil-pub)" />
              <path d="M6 16.5H11L13.5 11L16 21L18.5 11L21 16.5H26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-foreground">{{ pageData.title }}</h1>
        <p v-if="pageData.description" class="text-foreground-muted max-w-lg mx-auto">{{ pageData.description }}</p>
      </div>

      <!-- Overall Status Banner -->
      <div
        class="relative overflow-hidden rounded-[var(--radius-xl)] p-6 text-center animate-fade-in-up"
        :class="[overallBannerClasses, overallShadowClasses]"
      >
        <!-- Glow background effect -->
        <div class="absolute inset-0 opacity-30" :class="overallGlowClasses" />
        <div class="relative z-10 flex items-center justify-center gap-3">
          <component :is="overallIcon" class="w-6 h-6" />
          <span class="text-lg font-semibold">{{ overallStatusText }}</span>
        </div>
      </div>

      <!-- Monitors -->
      <div class="space-y-3">
        <div
          v-for="(monitor, monitorIndex) in pageData.monitors"
          :key="monitor.id"
          class="glass-card p-4 sm:p-5 hover:bg-surface-raised/30 transition-colors animate-fade-in-up"
          :style="{ transform: 'none', animationDelay: `${monitorIndex * 80}ms` }"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium text-foreground text-sm truncate mr-3">{{ monitor.name }}</span>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-medium" :class="monitorTextColor(monitor)">
                {{ monitorStatusText(monitor) }}
              </span>
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0"
                :class="monitorDot(monitor)"
              />
            </div>
          </div>

          <!-- 90-day uptime bar -->
          <div class="flex gap-px items-center h-8 rounded-sm">
            <div
              v-for="(day, i) in getUptimeDays(monitor)"
              :key="i"
              class="group/bar flex-1 h-full min-w-0 rounded-[1px] transition-all duration-150 cursor-default relative hover:opacity-80"
              :class="dayBarColor(day)"
              @mouseenter="hoveredDay = `${monitor.id}-${i}`"
              @mouseleave="hoveredDay = null"
            >
              <!-- Tooltip -->
              <div
                v-if="hoveredDay === `${monitor.id}-${i}`"
                class="absolute bottom-full mb-2 px-2.5 py-1.5 rounded-sm bg-surface-overlay border border-border-subtle text-xs whitespace-nowrap z-30 pointer-events-none shadow-lg"
                :class="tooltipAlign(i, 90)"
              >
                <p class="font-medium text-foreground">{{ formatDate(day.date) }}</p>
                <p :class="dayTooltipColor(day.status)">
                  {{ dayTooltipLabel(day.status) }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-foreground-subtle">90 days ago</span>
            <span class="text-xs font-medium" :class="uptimeColor(monitor.uptimePercent != null ? Number(monitor.uptimePercent) : null)">
              {{ monitor.uptimePercent != null ? `${Number(monitor.uptimePercent).toFixed(2)}%` : 'N/A' }} uptime
            </span>
            <span class="text-xs text-foreground-subtle">Today</span>
          </div>
        </div>
      </div>

      <!-- Active Incidents -->
      <div v-if="pageData.activeIncidents?.length" class="space-y-4 animate-fade-in">
        <h2 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Active Incidents</h2>
        <div class="space-y-4">
          <div
            v-for="incident in pageData.activeIncidents"
            :key="incident.id"
            class="glass-card p-5 sm:p-6 space-y-4 border-l-2"
            style="transform: none"
            :class="incidentBorderColor(incident.impact)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="font-semibold text-foreground wrap-break-word">{{ incident.title }}</h3>
                <div class="flex flex-wrap items-center gap-2 mt-1">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="impactBadgeClasses(incident.impact)"
                  >
                    {{ formatLabel(incident.impact) }}
                  </span>
                  <span class="text-xs text-foreground-subtle">{{ timeAgo(incident.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Affected Monitors -->
            <div v-if="incident.affectedMonitors?.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="name in incident.affectedMonitors"
                :key="name"
                class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-raised text-foreground-muted"
              >
                {{ name }}
              </span>
            </div>

            <!-- Updates timeline -->
            <div v-if="incident.updates?.length" class="space-y-3 pl-4 border-l border-border-subtle">
              <div v-for="update in incident.updates" :key="update.id" class="relative pl-4">
                <div class="absolute -left-1.25 top-1.5 w-2 h-2 rounded-full" :class="updateDotColor(update.status)" />
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <span class="text-xs font-medium" :class="updateStatusColor(update.status)">
                    {{ formatLabel(update.status) }}
                  </span>
                  <span class="text-xs text-foreground-subtle">{{ timeAgo(update.createdAt) }}</span>
                </div>
                <p class="text-sm text-foreground-muted wrap-break-word">{{ update.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Incidents (Past 14 days) -->
      <div v-if="groupedRecentIncidents.length" class="space-y-4 animate-fade-in">
        <h2 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Past Incidents</h2>

        <div v-for="group in groupedRecentIncidents" :key="group.date" class="space-y-2">
          <button
            class="flex items-center gap-2 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors w-full text-left"
            @click="toggleDateGroup(group.date)"
          >
            <ChevronRight
              class="w-3.5 h-3.5 transition-transform shrink-0"
              :class="expandedDates.has(group.date) && 'rotate-90'"
            />
            {{ group.dateLabel }}
          </button>

          <div v-if="expandedDates.has(group.date)" class="space-y-3 pl-5 animate-fade-in">
            <div
              v-for="incident in group.incidents"
              :key="incident.id"
              class="glass-card p-4 space-y-2"
              style="transform: none"
            >
              <div class="flex items-center gap-2">
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  :class="impactDotColor(incident.impact)"
                />
                <h4 class="text-sm font-medium text-foreground truncate">{{ incident.title }}</h4>
                <span
                  class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ml-auto shrink-0"
                  :class="impactBadgeClasses(incident.impact)"
                >
                  {{ formatLabel(incident.impact) }}
                </span>
              </div>
              <!-- Show latest update message -->
              <div v-if="incident.updates?.length" class="pl-4">
                <p class="text-xs text-foreground-subtle wrap-break-word">{{ incident.updates[0]?.message }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No incidents message -->
      <div v-if="!pageData.activeIncidents?.length && !groupedRecentIncidents.length" class="text-center py-4 animate-fade-in">
        <p class="text-sm text-foreground-subtle">No recent incidents to report.</p>
      </div>

      <!-- Footer -->
      <footer class="text-center py-8 border-t border-border-subtle animate-fade-in">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-xs text-foreground-subtle hover:text-accent-light transition-colors"
        >
          Powered by
          <span class="font-semibold gradient-text">Vigil</span>
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle, AlertTriangle, XCircle, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-vue-next'

// Public page: no auth, no layout wrapping
definePageMeta({
  layout: false,
  auth: false,
})

// ---------- Types ----------
interface DailyStatus {
  date: string
  status: string
  total?: number
  successful?: number
  failures?: number
}

interface Monitor {
  id: string
  name: string
  displayOrder: number
  currentStatus: 'operational' | 'down' | 'unknown'
  latestResponseTime: number | null
  latestCheckedAt: string | null
  uptimePercent: number | null
  dailyStatus: DailyStatus[]
}

interface IncidentUpdate {
  id: string
  message: string
  status: string
  createdAt: string
}

interface Incident {
  id: string
  title: string
  status: string
  impact: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
  updates: IncidentUpdate[]
  affectedMonitors: string[]
}

interface StatusPageData {
  slug: string
  title: string
  description: string | null
  monitors: Monitor[]
  activeIncidents: Incident[]
  recentIncidents: Incident[]
  overallStatus: 'operational' | 'major_outage' | 'partial_outage' | 'degraded'
}

// ---------- Data ----------
const route = useRoute()
const slug = route.params.slug as string
const { statusDotColor, statusTextColor, statusLabel, uptimeColor, timeAgo } = useStatusColor()

const { data: pageData, error: fetchError, status } = await useFetch<StatusPageData>(`/api/public/status/${slug}`)

// SEO
useHead({
  title: computed(() => pageData.value ? `${pageData.value.title} - Status` : 'Status Page'),
})

const hoveredDay = ref<string | null>(null)
const expandedDates = ref<Set<string>>(new Set())

// Expand first date group by default
watch(pageData, (val) => {
  if (val?.recentIncidents?.length) {
    const firstDate = getDateKey(val.recentIncidents[0].createdAt)
    expandedDates.value.add(firstDate)
  }
}, { immediate: true })

// ---------- Overall Status ----------
const overallStatus = computed(() => pageData.value?.overallStatus || 'operational')

const overallStatusText = computed(() => {
  switch (overallStatus.value) {
    case 'operational': return 'All Systems Operational'
    case 'degraded': return 'Degraded Performance'
    case 'partial_outage': return 'Partial System Outage'
    case 'major_outage': return 'Major System Outage'
    default: return 'All Systems Operational'
  }
})

const overallIcon = computed(() => {
  switch (overallStatus.value) {
    case 'operational': return CheckCircle
    case 'degraded': return AlertTriangle
    case 'partial_outage': return AlertTriangle
    case 'major_outage': return XCircle
    default: return CheckCircle
  }
})

const overallBannerClasses = computed(() => {
  switch (overallStatus.value) {
    case 'operational':
      return 'bg-success/10 text-success border border-success/20'
    case 'degraded':
      return 'bg-warning/10 text-warning border border-warning/20'
    case 'partial_outage':
      return 'bg-warning/10 text-warning border border-warning/20'
    case 'major_outage':
      return 'bg-danger/10 text-danger border border-danger/20'
    default:
      return 'bg-success/10 text-success border border-success/20'
  }
})

const overallGlowClasses = computed(() => {
  switch (overallStatus.value) {
    case 'operational':
      return 'bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]'
    case 'degraded':
    case 'partial_outage':
      return 'bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent_70%)]'
    case 'major_outage':
      return 'bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15),transparent_70%)]'
    default:
      return 'bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]'
  }
})

const overallShadowClasses = computed(() => {
  switch (overallStatus.value) {
    case 'operational':
      return 'shadow-[0_0_80px_rgba(16,185,129,0.15)]'
    case 'degraded':
    case 'partial_outage':
      return 'shadow-[0_0_80px_rgba(245,158,11,0.15)]'
    case 'major_outage':
      return 'shadow-[0_0_80px_rgba(239,68,68,0.15)]'
    default:
      return 'shadow-[0_0_80px_rgba(16,185,129,0.15)]'
  }
})

// ---------- Monitor Helpers ----------
function resolveMonitorStatus(monitor: Monitor): string | null {
  if (monitor.currentStatus === 'operational') return 'success'
  if (monitor.currentStatus === 'down') return 'failure'
  return null
}

function monitorStatusText(monitor: Monitor) {
  return statusLabel(resolveMonitorStatus(monitor))
}

function monitorTextColor(monitor: Monitor) {
  return statusTextColor(resolveMonitorStatus(monitor))
}

function monitorDot(monitor: Monitor) {
  return statusDotColor(resolveMonitorStatus(monitor))
}

// ---------- 90-Day Uptime Bar ----------
function getUptimeDays(monitor: Monitor): DailyStatus[] {
  const days = monitor.dailyStatus || []
  const result: DailyStatus[] = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const found = days.find((day) => day.date === dateStr)
    result.push({
      date: dateStr,
      status: found ? found.status : 'no_data',
    })
  }
  return result
}

function dayBarColor(day: DailyStatus): string {
  switch (day.status) {
    case 'success': return 'bg-success hover:bg-success/80'
    case 'failure':
    case 'error': return 'bg-danger hover:bg-danger/80'
    case 'timeout':
    case 'degraded': return 'bg-warning hover:bg-warning/80'
    default: return 'bg-surface-raised hover:bg-surface-overlay'
  }
}

function dayTooltipColor(status: string): string {
  switch (status) {
    case 'success': return 'text-success'
    case 'failure':
    case 'error': return 'text-danger'
    case 'degraded':
    case 'timeout': return 'text-warning'
    default: return 'text-foreground-subtle'
  }
}

function dayTooltipLabel(status: string): string {
  switch (status) {
    case 'success': return 'Operational'
    case 'failure':
    case 'error': return 'Downtime'
    case 'degraded': return 'Degraded'
    case 'timeout': return 'Timeout'
    default: return 'No data'
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Tooltip alignment: left-align near start, right-align near end, center otherwise
function tooltipAlign(index: number, total: number): string {
  if (index < 8) return 'left-0'
  if (index > total - 8) return 'right-0'
  return 'left-1/2 -translate-x-1/2'
}

// ---------- Incident Helpers ----------
function incidentBorderColor(impact: string): string {
  switch (impact) {
    case 'critical': return 'border-l-danger'
    case 'major': return 'border-l-danger'
    case 'minor': return 'border-l-warning'
    default: return 'border-l-foreground-subtle'
  }
}

function impactBadgeClasses(impact: string): string {
  switch (impact) {
    case 'critical': return 'bg-danger-muted text-danger'
    case 'major': return 'bg-danger-muted text-danger'
    case 'minor': return 'bg-warning-muted text-warning'
    default: return 'bg-surface-raised text-foreground-muted'
  }
}

function impactDotColor(impact: string): string {
  switch (impact) {
    case 'critical': return 'bg-danger'
    case 'major': return 'bg-danger'
    case 'minor': return 'bg-warning'
    default: return 'bg-foreground-subtle'
  }
}

function updateDotColor(status: string): string {
  switch (status) {
    case 'investigating': return 'bg-warning'
    case 'identified': return 'bg-warning'
    case 'monitoring': return 'bg-accent'
    case 'resolved': return 'bg-success'
    default: return 'bg-foreground-subtle'
  }
}

function updateStatusColor(status: string): string {
  switch (status) {
    case 'investigating': return 'text-warning'
    case 'identified': return 'text-warning'
    case 'monitoring': return 'text-accent-light'
    case 'resolved': return 'text-success'
    default: return 'text-foreground-muted'
  }
}

function formatLabel(str: string): string {
  if (!str) return ''
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---------- Recent Incidents Grouped by Date ----------
function getDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0]
}

const groupedRecentIncidents = computed(() => {
  const incidents = pageData.value?.recentIncidents || []
  const groups: Record<string, Incident[]> = {}
  for (const incident of incidents) {
    const key = getDateKey(incident.createdAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(incident)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, incidents]) => ({
      date,
      dateLabel: new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      incidents,
    }))
})

function toggleDateGroup(date: string) {
  const dates = expandedDates.value
  if (dates.has(date)) {
    dates.delete(date)
  } else {
    dates.add(date)
  }
}
</script>
