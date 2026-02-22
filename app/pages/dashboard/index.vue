<template>
  <div>
    <DashboardHeader>
      <template #title>Dashboard</template>
      <template #actions>
        <VButton
          size="sm"
          variant="outline"
          :loading="runningChecks"
          @click="handleRunChecks"
        >
          <Play class="w-3.5 h-3.5" />
          Run Checks
        </VButton>
      </template>
    </DashboardHeader>

    <div class="p-6 lg:p-8 space-y-8">
      <!-- Status Page Banner -->
      <div v-if="statusPages?.length" class="glass-card p-5 flex items-center justify-between gap-4" style="transform: none">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-[var(--radius-md)] bg-accent/10 flex items-center justify-center shrink-0">
            <Globe class="w-4.5 h-4.5 text-accent-light" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-foreground">Your Status Page</p>
            <p class="text-xs text-foreground-subtle truncate font-mono">
              {{ statusPageUrl }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <a
            :href="`/status/${(statusPages[0] as any).slug}`"
            target="_blank"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground bg-surface-raised hover:bg-surface-overlay rounded-[var(--radius-sm)] transition-colors"
          >
            <ExternalLink class="w-3 h-3" />
            View
          </a>
          <VButton size="sm" variant="outline" @click="navigateTo('/status-pages')">
            Manage
          </VButton>
        </div>
      </div>
      <div
        v-else-if="statusPagesStatus !== 'pending'"
        class="glass-card p-5 flex items-center justify-between gap-4 border-dashed"
        style="transform: none"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-[var(--radius-md)] bg-surface-raised flex items-center justify-center shrink-0">
            <Globe class="w-4.5 h-4.5 text-foreground-subtle" />
          </div>
          <p class="text-sm text-foreground-muted">Create a public status page to share system health with your users</p>
        </div>
        <VButton size="sm" variant="ghost" @click="navigateTo('/status-pages/new')">
          Create
        </VButton>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <div v-for="stat in stats" :key="stat.label" class="glass-card p-5 space-y-1" style="transform: none">
          <p class="text-xs text-foreground-subtle uppercase tracking-wider">{{ stat.label }}</p>
          <p class="text-2xl font-bold" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Monitors Grid -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Your Monitors</h2>
          <VButton size="sm" @click="navigateTo('/monitors/new')">
            <Plus class="w-4 h-4" />
            New Monitor
          </VButton>
        </div>

        <!-- Loading -->
        <div v-if="status === 'pending'" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="n in 3" :key="n" class="glass-card p-5 space-y-3 animate-pulse" style="transform: none">
            <div class="flex items-center gap-2.5">
              <div class="w-2.5 h-2.5 rounded-full bg-surface-raised" />
              <div class="h-4 w-32 rounded bg-surface-raised" />
            </div>
            <div class="h-3 w-48 rounded bg-surface-raised" />
            <div class="h-3 w-24 rounded bg-surface-raised" />
          </div>
        </div>

        <div v-else-if="monitors?.length" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <DashboardMonitorCard v-for="m in monitors" :key="m.id" :monitor="m" />
        </div>

        <!-- Empty State -->
        <div v-else class="glass-card p-12 text-center space-y-4" style="transform: none">
          <div class="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
            <Activity class="w-6 h-6 text-accent-light" />
          </div>
          <div>
            <h3 class="font-semibold text-foreground">No monitors yet</h3>
            <p class="text-sm text-foreground-muted mt-1">Create your first monitor to start watching your cron jobs.</p>
          </div>
          <VButton @click="navigateTo('/monitors/new')">
            <Plus class="w-4 h-4" />
            Create Monitor
          </VButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Activity, Play, Globe, ExternalLink } from 'lucide-vue-next'
import type { MonitorWithLatest } from '~~/shared/types'
import { PLANS } from '~~/shared/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { session } = useUserSession()
const plan = computed(() => PLANS[session.value?.user?.plan as keyof typeof PLANS || 'free'])

const { success, error } = useToast()
const runningChecks = ref(false)

const { data: monitorsData, status, refresh } = await useFetch('/api/monitors')
const monitors = computed(() => (monitorsData.value as MonitorWithLatest[] | null) || [])

const { data: statusPagesData, status: statusPagesStatus } = await useFetch('/api/status-pages')
const statusPages = computed(() => (statusPagesData.value as any[] | null) || [])
const statusPageUrl = computed(() => {
  if (!statusPages.value.length) return ''
  const slug = (statusPages.value[0] as any).slug
  if (import.meta.client) return `${window.location.origin}/status/${slug}`
  return `/status/${slug}`
})

async function handleRunChecks() {
  runningChecks.value = true
  try {
    const result = await $fetch('/api/monitors/check', { method: 'POST' }) as any
    success(`Checked ${result.checked} monitor${result.checked !== 1 ? 's' : ''}`)
    await refresh()
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to run checks')
  } finally {
    runningChecks.value = false
  }
}

const stats = computed(() => {
  const total = monitors.value.length
  const max = plan.value.maxMonitors
  const successful = monitors.value.filter(m => m.latestStatus === 'success').length
  const uptimeValues = monitors.value
    .filter(m => m.uptimePercent !== null)
    .map(m => m.uptimePercent!)
  const avgUptime = uptimeValues.length
    ? uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length
    : null
  const incidents = monitors.value.filter(m => m.latestStatus && m.latestStatus !== 'success').length

  return [
    { label: 'Monitors', value: `${total} / ${max}`, color: 'text-foreground' },
    { label: 'Uptime', value: avgUptime !== null ? `${avgUptime.toFixed(1)}%` : 'N/A', color: avgUptime && avgUptime >= 99 ? 'text-success' : avgUptime && avgUptime >= 95 ? 'text-warning' : 'text-foreground' },
    { label: 'Healthy', value: `${successful}`, color: 'text-success' },
    { label: 'Incidents', value: `${incidents}`, color: incidents > 0 ? 'text-warning' : 'text-foreground' },
  ]
})
</script>
