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

    <div class="p-4 sm:p-6 lg:p-8">
      <!-- Loading -->
      <div v-if="status === 'pending'" class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="n in 3" :key="n" class="glass-card-static p-5 space-y-3 animate-pulse">
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
          @click="navigateTo(`/status-pages/${page.id}/edit`)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="font-semibold text-foreground truncate">{{ page.title }}</h3>
              <p class="text-xs text-foreground-subtle mt-0.5 font-mono truncate">/status/{{ page.slug }}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <a
                :href="`/status/${page.slug}`"
                target="_blank"
                class="p-1.5 rounded-[var(--radius-sm)] text-foreground-subtle hover:text-accent-light hover:bg-accent/10 transition-colors"
                title="View public page"
                @click.stop
              >
                <ExternalLink class="w-4 h-4" />
              </a>
              <button
                class="p-1.5 rounded-[var(--radius-sm)] text-foreground-subtle hover:text-danger hover:bg-danger/10 transition-colors"
                title="Delete status page"
                @click.stop="confirmDelete(page)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
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
      <div v-else class="glass-card-static p-16 text-center space-y-4 border-dashed">
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

    <!-- Delete Dialog -->
    <VDialog v-model="showDelete" title="Delete Status Page">
      <p class="text-sm text-foreground-muted">
        Are you sure you want to delete <strong class="text-foreground">{{ deleteTarget?.title }}</strong>?
        This will permanently remove the status page and its public URL.
      </p>
      <template #footer>
        <VButton variant="ghost" @click="showDelete = false">Cancel</VButton>
        <VButton variant="danger" :loading="deleting" @click="handleDelete">Delete</VButton>
      </template>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Globe, Activity, ExternalLink, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { success, error } = useToast()

const { data: statusPagesData, status, refresh } = await useFetch('/api/status-pages')
const statusPages = computed(() => (statusPagesData.value as any[] | null) || [])

const showDelete = ref(false)
const deleting = ref(false)
const deleteTarget = ref<any>(null)

function confirmDelete(page: any) {
  deleteTarget.value = page
  showDelete.value = true
}

async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $fetch(`/api/status-pages/${deleteTarget.value.id}`, { method: 'DELETE' })
    success('Status page deleted')
    showDelete.value = false
    deleteTarget.value = null
    await refresh()
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to delete status page')
  } finally {
    deleting.value = false
  }
}
</script>
