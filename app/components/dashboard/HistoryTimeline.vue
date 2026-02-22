<template>
  <div class="overflow-x-auto">
    <table v-if="results.length" class="w-full text-sm min-w-135">
      <thead>
        <tr class="border-b border-border-subtle text-left">
          <th class="px-4 sm:px-6 py-3 text-xs font-medium text-foreground-subtle uppercase tracking-wider">Time</th>
          <th class="px-4 sm:px-6 py-3 text-xs font-medium text-foreground-subtle uppercase tracking-wider">Status</th>
          <th class="px-4 sm:px-6 py-3 text-xs font-medium text-foreground-subtle uppercase tracking-wider">Code</th>
          <th class="px-4 sm:px-6 py-3 text-xs font-medium text-foreground-subtle uppercase tracking-wider">Response</th>
          <th class="px-4 sm:px-6 py-3 text-xs font-medium text-foreground-subtle uppercase tracking-wider">Error</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="result in displayedResults"
          :key="result.id"
          class="border-b border-border-subtle/50 hover:bg-surface-raised/50 transition-colors"
        >
          <td class="px-4 sm:px-6 py-3 text-foreground-muted whitespace-nowrap">
            {{ formatDate(result.executedAt) }}
          </td>
          <td class="px-4 sm:px-6 py-3">
            <DashboardStatusBadge :status="result.status" />
          </td>
          <td class="px-4 sm:px-6 py-3 font-mono text-foreground-muted">
            {{ result.responseCode || '\u2014' }}
          </td>
          <td class="px-4 sm:px-6 py-3 font-mono text-foreground-muted whitespace-nowrap">
            {{ result.responseTimeMs ? `${result.responseTimeMs}ms` : '\u2014' }}
          </td>
          <td class="px-4 sm:px-6 py-3 text-foreground-subtle max-w-xs truncate">
            {{ result.errorMessage || '\u2014' }}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty -->
    <div v-else class="px-4 sm:px-6 py-12 text-center text-sm text-foreground-subtle">
      No check results yet. Results will appear after the first cron run.
    </div>

    <!-- Load More -->
    <div v-if="results.length > displayCount" class="px-4 sm:px-6 py-4 text-center border-t border-border-subtle/50">
      <VButton variant="ghost" size="sm" @click="displayCount += 50">
        Load More
      </VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

const props = defineProps<{
  results: Array<{
    id: string
    status: string
    responseCode: number | null
    responseTimeMs: number | null
    errorMessage: string | null
    executedAt: string
  }>
}>()

const displayCount = ref(50)
const displayedResults = computed(() => props.results.slice(0, displayCount.value))

function formatDate(date: string): string {
  return format(new Date(date), 'MMM d, HH:mm:ss')
}
</script>
