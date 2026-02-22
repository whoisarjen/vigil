<template>
  <div>
    <DashboardHeader>
      <template #title>
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink to="/monitors" class="text-foreground-subtle hover:text-accent-light transition-colors shrink-0">
            Monitors
          </NuxtLink>
          <ChevronRight class="w-4 h-4 text-foreground-subtle shrink-0" />
          <span class="truncate">{{ data?.name || 'Monitor' }}</span>
        </div>
      </template>
      <template #actions>
        <VButton variant="outline" size="sm" @click="navigateTo(`/monitors/${id}/edit`)">
          <Pencil class="w-3.5 h-3.5" />
          Edit
        </VButton>
        <VButton variant="danger" size="sm" @click="showDelete = true">
          <Trash2 class="w-3.5 h-3.5" />
          Delete
        </VButton>
      </template>
    </DashboardHeader>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="p-4 sm:p-6 lg:p-8 space-y-8">
      <div class="flex items-center gap-4">
        <div class="w-3 h-3 rounded-full bg-surface-raised animate-pulse" />
        <div class="h-5 w-20 rounded bg-surface-raised animate-pulse" />
        <div class="h-4 w-48 rounded bg-surface-raised animate-pulse" />
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="n in 4" :key="n" class="glass-card-static p-5 space-y-2 animate-pulse">
          <div class="h-3 w-16 rounded bg-surface-raised" />
          <div class="h-7 w-24 rounded bg-surface-raised" />
        </div>
      </div>
      <div class="glass-card-static p-6 animate-pulse">
        <div class="h-3 w-32 rounded bg-surface-raised mb-4" />
        <div class="h-32 rounded bg-surface-raised" />
      </div>
    </div>

    <!-- Error / Not Found -->
    <div v-else-if="!data" class="p-4 sm:p-6 lg:p-8">
      <div class="glass-card-static p-12 text-center space-y-3">
        <p class="text-lg font-semibold text-foreground">Monitor not found</p>
        <p class="text-sm text-foreground-muted">This monitor may have been deleted.</p>
        <VButton variant="secondary" @click="navigateTo('/monitors')">Back to Monitors</VButton>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 space-y-8">
      <!-- Status Bar -->
      <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
        <span
          class="w-3 h-3 rounded-full shrink-0"
          :class="statusDotColor(data.results?.[0]?.status)"
        />
        <DashboardStatusBadge
          v-if="data.results?.[0]"
          :status="data.results[0].status"
        />
        <span class="text-sm text-foreground-muted font-mono truncate max-w-50 sm:max-w-xs md:max-w-md">{{ data.url }}</span>
        <VBadge size="sm">{{ data.method }}</VBadge>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <div class="glass-card-static p-5 space-y-1">
          <p class="text-xs text-foreground-subtle uppercase tracking-wider">Uptime</p>
          <p
            class="text-2xl font-bold"
            :class="uptimeColor(data.stats.uptimePercent)"
          >
            {{ data.stats.uptimePercent !== null ? `${data.stats.uptimePercent.toFixed(1)}%` : 'N/A' }}
          </p>
        </div>
        <div class="glass-card-static p-5 space-y-1">
          <p class="text-xs text-foreground-subtle uppercase tracking-wider">Avg Response</p>
          <p class="text-2xl font-bold text-foreground">
            {{ data.stats.avgResponseTime ? formatResponseTime(data.stats.avgResponseTime) : 'N/A' }}
          </p>
        </div>
        <div class="glass-card-static p-5 space-y-1">
          <p class="text-xs text-foreground-subtle uppercase tracking-wider">Total Checks</p>
          <p class="text-2xl font-bold text-foreground">{{ data.stats.totalChecks }}</p>
        </div>
        <div class="glass-card-static p-5 space-y-1">
          <p class="text-xs text-foreground-subtle uppercase tracking-wider">Last Checked</p>
          <p class="text-2xl font-bold text-foreground">
            {{ data.stats.lastChecked ? timeAgo(data.stats.lastChecked) : 'Never' }}
          </p>
        </div>
      </div>

      <!-- Uptime Chart -->
      <div class="glass-card-static p-4 sm:p-6">
        <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider mb-4">Response Time (7 days)</h3>
        <DashboardUptimeChart :results="data.results || []" />
      </div>

      <!-- History Table -->
      <div class="glass-card-static overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-border-subtle">
          <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Check History</h3>
        </div>
        <DashboardHistoryTimeline :results="data.results || []" />
      </div>
    </div>

    <!-- Delete Dialog -->
    <VDialog v-model="showDelete" title="Delete Monitor">
      <p class="text-sm text-foreground-muted">
        Are you sure you want to delete <strong class="text-foreground">{{ data?.name }}</strong>?
        This will permanently remove all check history.
      </p>
      <template #footer>
        <VButton variant="ghost" @click="showDelete = false">Cancel</VButton>
        <VButton variant="danger" :loading="deleting" @click="handleDelete">Delete</VButton>
      </template>
    </VDialog>

  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Pencil, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const id = route.params.id as string
const { success, error } = useToast()
const { statusDotColor, uptimeColor, timeAgo } = useStatusColor()

const showDelete = ref(false)
const deleting = ref(false)

const { data, status } = await useFetch(`/api/monitors/${id}`)

async function handleDelete() {
  deleting.value = true
  try {
    await $fetch(`/api/monitors/${id}`, { method: 'DELETE' })
    success('Monitor deleted')
    navigateTo('/monitors')
  } catch (err: any) {
    error(err.data?.message || err.data?.statusMessage || 'Failed to delete')
    deleting.value = false
  }
}
</script>
