<template>
  <div>
    <div v-if="results.length" class="flex items-end gap-[2px] h-32">
      <div
        v-for="(bar, i) in chartBars"
        :key="i"
        class="flex-1 min-w-[3px] rounded-t-sm transition-all duration-200 cursor-pointer group relative"
        :class="bar.colorClass"
        :style="{ height: bar.height }"
      >
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
          <div class="bg-surface-overlay border border-border rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[10px] whitespace-nowrap shadow-lg">
            <p class="text-foreground font-medium">{{ bar.time }}</p>
            <p class="text-foreground-muted">{{ bar.responseTime }} · {{ bar.status }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="h-32 flex items-center justify-center text-sm text-foreground-subtle">
      No data yet
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps<{
  results: Array<{
    status: string
    responseTimeMs: number | null
    executedAt: string
  }>
}>()

const chartBars = computed(() => {
  // Take last 100 results, reversed to show oldest first
  const data = [...props.results].reverse().slice(-100)
  if (!data.length) return []

  const maxTime = Math.max(...data.map(r => r.responseTimeMs || 0), 1)

  return data.map(r => {
    const heightPercent = Math.max(((r.responseTimeMs || 0) / maxTime) * 100, 4)
    return {
      height: `${heightPercent}%`,
      colorClass: r.status === 'success' ? 'bg-success/70 hover:bg-success' :
                  r.status === 'timeout' ? 'bg-warning/70 hover:bg-warning' :
                  'bg-danger/70 hover:bg-danger',
      time: format(new Date(r.executedAt), 'MMM d, HH:mm'),
      responseTime: r.responseTimeMs ? `${r.responseTimeMs}ms` : 'N/A',
      status: r.status,
    }
  })
})
</script>
