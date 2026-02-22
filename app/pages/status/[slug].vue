<template>
  <div class="min-h-screen bg-background bg-dot-pattern">
    <!-- Loading -->
    <div v-if="status === 'pending'" class="max-w-3xl mx-auto px-4 py-16 space-y-8">
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
    <div v-else-if="fetchError" class="max-w-3xl mx-auto px-4 py-16">
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
    <div v-else-if="pageData" class="max-w-3xl mx-auto px-4 py-12 space-y-8">

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
      <div class="space-y-3 stagger">
        <div
          v-for="monitor in pageData.monitors"
          :key="monitor.id"
          class="glass-card p-5 hover:bg-surface-raised/30 transition-colors"
          style="transform: none"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium text-foreground text-sm">{{ monitor.name }}</span>
            <div class="flex items-center gap-2">
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
          <div class="flex gap-px items-center h-8 group">
            <div
              v-for="(day, i) in getUptimeDays(monitor)"
              :key="i"
              class="flex-1 h-full rounded-sm transition-all duration-200 cursor-default relative"
              :class="dayBarColor(day)"
              @mouseenter="hoveredDay = `${monitor.id}-${i}`"
              @mouseleave="hoveredDay = null"
            >
              <!-- Tooltip -->
              <div
                v-if="hoveredDay === `${monitor.id}-${i}`"
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-surface-overlay border border-border-subtle text-xs whitespace-nowrap z-20 pointer-events-none shadow-lg"
              >
                <p class="font-medium text-foreground">{{ day.date }}</p>
                <p :class="day.status === 'success' ? 'text-success' : day.status === 'failure' ? 'text-danger' : 'text-foreground-subtle'">
                  {{ day.status === 'success' ? 'Operational' : day.status === 'failure' ? 'Downtime' : 'No data' }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-foreground-subtle">90 days ago</span>
            <span class="text-xs font-medium" :class="uptimeColor(Number(monitor.uptimePercent) || null)">
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
            class="glass-card p-6 space-y-4 border-l-2"
            style="transform: none"
            :class="incidentBorderColor(incident.impact)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-semibold text-foreground">{{ incident.title }}</h3>
                <div class="flex items-center gap-2 mt-1">
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

            <!-- Updates timeline -->
            <div v-if="incident.updates?.length" class="space-y-3 pl-4 border-l border-border-subtle">
              <div v-for="(update, i) in incident.updates" :key="i" class="relative pl-4">
                <div class="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" :class="updateDotColor(update.status)" />
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium" :class="updateStatusColor(update.status)">
                    {{ formatLabel(update.status) }}
                  </span>
                  <span class="text-xs text-foreground-subtle">{{ formatTimeOnly(update.createdAt) }}</span>
                </div>
                <p class="text-sm text-foreground-muted">{{ update.message }}</p>
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
            class="flex items-center gap-2 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors w-full"
            @click="toggleDateGroup(group.date)"
          >
            <ChevronRight
              class="w-3.5 h-3.5 transition-transform"
              :class="expandedDates.includes(group.date) && 'rotate-90'"
            />
            {{ group.dateLabel }}
          </button>

          <div v-if="expandedDates.includes(group.date)" class="space-y-3 pl-5 animate-fade-in">
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
                <h4 class="text-sm font-medium text-foreground">{{ incident.title }}</h4>
                <span
                  class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ml-auto"
                  :class="impactBadgeClasses(incident.impact)"
                >
                  {{ formatLabel(incident.impact) }}
                </span>
              </div>
              <!-- Show latest update message -->
              <div v-if="incident.updates?.length" class="pl-4">
                <p class="text-xs text-foreground-subtle">{{ incident.updates[0]?.message }}</p>
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

definePageMeta({
  layout: 'default',
})

const route = useRoute()
const slug = route.params.slug as string
const { statusDotColor, statusTextColor, statusLabel, uptimeColor, timeAgo } = useStatusColor()

const { data: pageData, error: fetchError, status } = await useFetch(`/api/public/status/${slug}`)

// SEO
useHead({
  title: computed(() => pageData.value ? `${(pageData.value as any).title} - Status` : 'Status Page'),
})

const hoveredDay = ref<string | null>(null)
const expandedDates = ref<string[]>([])

// Expand first date group by default
watch(pageData, (val: any) => {
  if (val?.recentIncidents?.length) {
    const firstDate = getDateKey(val.recentIncidents[0].createdAt)
    if (!expandedDates.value.includes(firstDate)) {
      expandedDates.value.push(firstDate)
    }
  }
}, { immediate: true })

// Overall status
const overallStatus = computed(() => (pageData.value as any)?.overallStatus || 'operational')

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

// Monitor helpers - use composable for status mapping
function resolveMonitorStatus(monitor: any): string | null {
  // API returns currentStatus: 'operational' | 'down' | 'unknown'
  if (monitor.currentStatus === 'operational') return 'success'
  if (monitor.currentStatus === 'down') return 'failure'
  return null
}

function monitorStatusText(monitor: any) {
  return statusLabel(resolveMonitorStatus(monitor))
}

function monitorTextColor(monitor: any) {
  return statusTextColor(resolveMonitorStatus(monitor))
}

function monitorDot(monitor: any) {
  return statusDotColor(resolveMonitorStatus(monitor))
}

// 90-day uptime bar
function getUptimeDays(monitor: any) {
  const days = monitor.dailyStatus || monitor.uptimeDays || []
  // Pad to 90 days
  const result = []
  const now = new Date()
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const found = days.find((day: any) => day.date === dateStr)
    result.push({
      date: dateStr,
      status: found ? found.status : 'no_data',
    })
  }
  return result
}

function dayBarColor(day: any) {
  switch (day.status) {
    case 'success': return 'bg-success hover:bg-success/80'
    case 'failure':
    case 'error': return 'bg-danger hover:bg-danger/80'
    case 'timeout':
    case 'degraded': return 'bg-warning hover:bg-warning/80'
    default: return 'bg-surface-raised hover:bg-surface-overlay'
  }
}

// Incident helpers
function incidentBorderColor(impact: string) {
  switch (impact) {
    case 'critical': return 'border-l-danger'
    case 'major': return 'border-l-danger'
    case 'minor': return 'border-l-warning'
    default: return 'border-l-foreground-subtle'
  }
}

function impactBadgeClasses(impact: string) {
  switch (impact) {
    case 'critical': return 'bg-danger-muted text-danger'
    case 'major': return 'bg-danger-muted text-danger'
    case 'minor': return 'bg-warning-muted text-warning'
    default: return 'bg-surface-raised text-foreground-muted'
  }
}

function impactDotColor(impact: string) {
  switch (impact) {
    case 'critical': return 'bg-danger'
    case 'major': return 'bg-danger'
    case 'minor': return 'bg-warning'
    default: return 'bg-foreground-subtle'
  }
}

function updateDotColor(status: string) {
  switch (status) {
    case 'investigating': return 'bg-warning'
    case 'identified': return 'bg-warning'
    case 'monitoring': return 'bg-accent'
    case 'resolved': return 'bg-success'
    default: return 'bg-foreground-subtle'
  }
}

function updateStatusColor(status: string) {
  switch (status) {
    case 'investigating': return 'text-warning'
    case 'identified': return 'text-warning'
    case 'monitoring': return 'text-accent-light'
    case 'resolved': return 'text-success'
    default: return 'text-foreground-muted'
  }
}

function formatLabel(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatTimeOnly(dateStr: string) {
  return timeAgo(dateStr)
}

// Recent incidents grouped by date
function getDateKey(dateStr: string) {
  return new Date(dateStr).toISOString().split('T')[0]
}

const groupedRecentIncidents = computed(() => {
  const incidents = (pageData.value as any)?.recentIncidents || []
  const groups: Record<string, any[]> = {}
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
  const idx = expandedDates.value.indexOf(date)
  if (idx >= 0) {
    expandedDates.value.splice(idx, 1)
  } else {
    expandedDates.value.push(date)
  }
}
</script>
