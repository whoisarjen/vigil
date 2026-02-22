<template>
  <div>
    <DashboardHeader>
      <template #title>Dashboard</template>
    </DashboardHeader>

    <div class="p-6 lg:p-8 space-y-8">
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
import { Plus, Activity } from 'lucide-vue-next'
import type { MonitorWithLatest } from '~~/shared/types'
import { PLANS } from '~~/shared/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { session } = useUserSession()
const plan = computed(() => PLANS[session.value?.user?.plan as keyof typeof PLANS || 'free'])

const { data: monitorsData, status } = await useFetch('/api/monitors')
const monitors = computed(() => (monitorsData.value as MonitorWithLatest[] | null) || [])

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
