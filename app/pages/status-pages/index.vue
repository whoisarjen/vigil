<template>
  <div>
    <DashboardHeader>
      <template #title>Status Pages</template>
      <template #actions>
        <VButton size="sm" @click="navigateTo('/status-pages/new')">
          <Plus class="w-4 h-4" />
          New Status Page
        </VButton>
      </template>
    </DashboardHeader>

    <div class="p-6 lg:p-8">
      <!-- Loading -->
      <div v-if="status === 'pending'" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="n in 3" :key="n" class="glass-card p-5 space-y-3 animate-pulse" style="transform: none">
          <div class="h-5 w-36 rounded bg-surface-raised" />
          <div class="h-3 w-24 rounded bg-surface-raised" />
          <div class="flex items-center gap-2">
            <div class="h-5 w-16 rounded bg-surface-raised" />
            <div class="h-5 w-20 rounded bg-surface-raised" />
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div v-else-if="statusPages?.length" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="page in statusPages"
          :key="page.id"
          class="glass-card p-5 space-y-3 group hover:border-accent/20 transition-colors cursor-pointer"
          style="transform: none"
          @click="navigateTo(`/status-pages/${page.id}/edit`)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="font-semibold text-foreground truncate">{{ page.title }}</h3>
              <p class="text-xs text-foreground-subtle mt-0.5 font-mono truncate">/status/{{ page.slug }}</p>
            </div>
            <a
              :href="`/status/${page.slug}`"
              target="_blank"
              class="shrink-0 p-1.5 rounded-[var(--radius-sm)] text-foreground-subtle hover:text-accent-light hover:bg-accent/10 transition-colors"
              title="View public page"
              @click.stop
            >
              <ExternalLink class="w-4 h-4" />
            </a>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <VBadge :variant="page.isPublic ? 'success' : 'default'" size="sm">
              {{ page.isPublic ? 'Public' : 'Private' }}
            </VBadge>
            <VBadge size="sm">
              <Activity class="w-3 h-3" />
              {{ page.monitorCount || 0 }} monitor{{ (page.monitorCount || 0) !== 1 ? 's' : '' }}
            </VBadge>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="glass-card p-16 text-center space-y-4" style="transform: none">
        <div class="w-14 h-14 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <Globe class="w-7 h-7 text-accent-light" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-foreground">No status pages yet</h3>
          <p class="text-sm text-foreground-muted mt-1 max-w-sm mx-auto">
            Create a public status page to share your system health with users.
          </p>
        </div>
        <VButton @click="navigateTo('/status-pages/new')">
          <Plus class="w-4 h-4" />
          Create Your First Status Page
        </VButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Globe, Activity, ExternalLink } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { data: statusPagesData, status } = await useFetch('/api/status-pages')
const statusPages = computed(() => (statusPagesData.value as any[] | null) || [])
</script>
