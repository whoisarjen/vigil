<template>
  <div>
    <DashboardHeader>
      <template #title>Monitors</template>
      <template #actions>
        <VButton size="sm" @click="navigateTo('/monitors/new')">
          <Plus class="w-4 h-4" />
          New Monitor
        </VButton>
      </template>
    </DashboardHeader>

    <div class="p-4 sm:p-6 lg:p-8">
      <!-- Loading -->
      <div v-if="status === 'pending'" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="n in 3" :key="n" class="glass-card-static p-5 space-y-3 animate-pulse">
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
      <div v-else class="glass-card-static p-16 text-center space-y-4">
        <div class="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <Activity class="w-7 h-7 text-accent-light" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-foreground">No monitors yet</h3>
          <p class="text-sm text-foreground-muted mt-1 max-w-sm mx-auto">
            Create your first monitor to start watching your cron job endpoints.
          </p>
        </div>
        <VButton @click="navigateTo('/monitors/new')">
          <Plus class="w-4 h-4" />
          Create Your First Monitor
        </VButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Activity } from 'lucide-vue-next'
import type { MonitorWithLatest } from '~~/shared/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { data: monitorsData, status } = await useFetch('/api/monitors')
const monitors = computed(() => (monitorsData.value as MonitorWithLatest[] | null) || [])
</script>
