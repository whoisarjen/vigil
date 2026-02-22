<template>
  <NuxtLink :to="`/monitors/${monitor.id}`" class="block group">
    <div class="glass-card p-5 space-y-3 hover:border-accent/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-200">
      <!-- Top Row: Status + Name + Toggle -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :class="statusDotColor(monitor.latestStatus)"
          />
          <span class="font-medium text-foreground text-sm truncate">{{ monitor.name }}</span>
        </div>
        <DashboardStatusBadge
          v-if="monitor.latestStatus"
          :status="monitor.latestStatus"
          :label="monitor.enabled ? undefined : 'Paused'"
        />
      </div>

      <!-- URL -->
      <p class="text-xs font-mono text-foreground-subtle truncate">{{ monitor.url }}</p>

      <!-- Bottom Row: Method + Response Time + Interval -->
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <VBadge size="sm">{{ monitor.method }}</VBadge>
          <span v-if="monitor.latestResponseTime" class="text-foreground-muted">
            {{ formatResponseTime(monitor.latestResponseTime) }}
          </span>
        </div>
        <span class="text-foreground-subtle">
          {{ formatInterval(monitor.scheduleInterval) }}
        </span>
      </div>

      <!-- Mini Uptime Bar -->
      <div v-if="monitor.uptimePercent !== null" class="pt-1">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] text-foreground-subtle uppercase tracking-wider">Uptime</span>
          <span
            class="text-xs font-medium"
            :class="uptimeColor(monitor.uptimePercent)"
          >
            {{ formatUptimePercent(monitor.uptimePercent) }}
          </span>
        </div>
        <div class="h-1.5 bg-surface-raised rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="monitor.uptimePercent >= 99 ? 'bg-success' : monitor.uptimePercent >= 95 ? 'bg-warning' : 'bg-danger'"
            :style="{ width: `${Math.min(monitor.uptimePercent, 100)}%` }"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { MonitorWithLatest } from '~~/shared/types'

defineProps<{
  monitor: MonitorWithLatest
}>()

const { statusDotColor, uptimeColor } = useStatusColor()

function formatInterval(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${minutes / 60}h`
  return `${minutes / 1440}d`
}
</script>
