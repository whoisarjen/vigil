<template>
  <div>
    <DashboardHeader>
      <template #title>Incidents</template>
      <template #actions>
        <VButton size="sm" @click="navigateTo('/incidents/new')">
          <Plus class="w-4 h-4" />
          New Incident
        </VButton>
      </template>
    </DashboardHeader>

    <div class="p-4 sm:p-6 lg:p-8 space-y-6">
      <!-- Filter Tabs -->
      <div v-if="incidents?.length" class="flex items-center gap-1 p-1 bg-surface-raised rounded-[var(--radius-md)] w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] transition-colors"
          :class="activeTab === tab.value
            ? 'bg-accent text-white shadow-sm'
            : 'text-foreground-muted hover:text-foreground hover:bg-surface-overlay'"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="tab.count > 0"
            class="ml-1 px-1.5 py-0.5 text-[10px] rounded-full"
            :class="activeTab === tab.value
              ? 'bg-white/20'
              : 'bg-surface-overlay'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="status === 'pending'" class="space-y-3">
        <div v-for="n in 4" :key="n" class="glass-card-static p-5 animate-pulse">
          <div class="flex items-center gap-4">
            <div class="h-5 w-48 rounded bg-surface-raised" />
            <div class="h-5 w-20 rounded bg-surface-raised" />
            <div class="h-5 w-16 rounded bg-surface-raised" />
          </div>
        </div>
      </div>

      <!-- List -->
      <div v-else-if="filteredIncidents?.length" class="space-y-3">
        <NuxtLink
          v-for="incident in filteredIncidents"
          :key="incident.id"
          :to="`/incidents/${incident.id}`"
          class="glass-card-static p-5 block hover:border-border-accent transition-colors group"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h3 class="font-semibold text-foreground group-hover:text-accent-light transition-colors truncate">
                  {{ incident.title }}
                </h3>
                <VBadge :variant="incidentStatusVariant(incident.status)" size="sm">
                  {{ formatStatus(incident.status) }}
                </VBadge>
                <VBadge :variant="incidentImpactVariant(incident.impact)" size="sm">
                  {{ formatImpact(incident.impact) }}
                </VBadge>
              </div>
              <div class="flex items-center gap-3 mt-2 text-xs text-foreground-subtle">
                <span v-if="incident.statusPageTitle" class="flex items-center gap-1">
                  <Globe class="w-3 h-3" />
                  {{ incident.statusPageTitle }}
                </span>
                <span>{{ timeAgo(incident.createdAt) }}</span>
                <span v-if="incident.affectedMonitors?.length" class="flex items-center gap-1">
                  <Activity class="w-3 h-3" />
                  {{ incident.affectedMonitors.length }} monitor{{ incident.affectedMonitors.length !== 1 ? 's' : '' }}
                </span>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-foreground-subtle shrink-0 mt-1 group-hover:text-accent-light transition-colors" />
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-else-if="!incidents?.length" class="glass-card-static p-16 text-center space-y-4">
        <div class="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <AlertTriangle class="w-7 h-7 text-accent-light" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-foreground">No incidents</h3>
          <p class="text-sm text-foreground-muted mt-1 max-w-sm mx-auto">
            Everything is running smoothly. Create an incident to communicate issues to your users.
          </p>
        </div>
        <VButton @click="navigateTo('/incidents/new')">
          <Plus class="w-4 h-4" />
          Report an Incident
        </VButton>
      </div>

      <!-- Empty filtered state -->
      <div v-else class="glass-card-static p-12 text-center space-y-2">
        <p class="text-sm text-foreground-muted">No {{ activeTab }} incidents found.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, AlertTriangle, Globe, Activity, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { incidentStatusVariant, incidentImpactVariant, timeAgo } = useStatusColor()
const activeTab = ref<'all' | 'active' | 'resolved'>('all')

const { data: incidentsData, status } = await useFetch('/api/incidents')
const incidents = computed(() => (incidentsData.value as any[] | null) || [])

const filteredIncidents = computed(() => {
  if (activeTab.value === 'all') return incidents.value
  if (activeTab.value === 'active') return incidents.value.filter((i: any) => i.status !== 'resolved')
  return incidents.value.filter((i: any) => i.status === 'resolved')
})

const tabs = computed(() => [
  { value: 'all' as const, label: 'All', count: incidents.value.length },
  { value: 'active' as const, label: 'Active', count: incidents.value.filter((i: any) => i.status !== 'resolved').length },
  { value: 'resolved' as const, label: 'Resolved', count: incidents.value.filter((i: any) => i.status === 'resolved').length },
])

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatImpact(impact: string) {
  return impact.charAt(0).toUpperCase() + impact.slice(1)
}
</script>
