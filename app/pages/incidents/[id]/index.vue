<template>
  <div>
    <DashboardHeader>
      <template #title>
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink to="/incidents" class="text-foreground-subtle hover:text-accent-light transition-colors shrink-0">
            Incidents
          </NuxtLink>
          <ChevronRight class="w-4 h-4 text-foreground-subtle shrink-0" />
          <span class="truncate">{{ data?.title || 'Incident' }}</span>
        </div>
      </template>
      <template #actions>
        <VButton variant="danger" size="sm" @click="showDelete = true">
          <Trash2 class="w-3.5 h-3.5" />
          Delete
        </VButton>
      </template>
    </DashboardHeader>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="p-4 sm:p-6 lg:p-8 space-y-6">
      <div class="flex items-center gap-4">
        <div class="h-5 w-48 rounded bg-surface-raised animate-pulse" />
        <div class="h-5 w-20 rounded bg-surface-raised animate-pulse" />
        <div class="h-5 w-16 rounded bg-surface-raised animate-pulse" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="n in 3" :key="n" class="glass-card-static p-5 space-y-2 animate-pulse">
          <div class="h-3 w-16 rounded bg-surface-raised" />
          <div class="h-5 w-24 rounded bg-surface-raised" />
        </div>
      </div>
      <div class="glass-card-static p-6 animate-pulse">
        <div class="h-24 rounded bg-surface-raised" />
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!data" class="p-4 sm:p-6 lg:p-8">
      <div class="glass-card-static p-12 text-center space-y-3">
        <p class="text-lg font-semibold text-foreground">Incident not found</p>
        <p class="text-sm text-foreground-muted">This incident may have been deleted.</p>
        <VButton variant="secondary" @click="navigateTo('/incidents')">Back to Incidents</VButton>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 space-y-6">
      <!-- Header Info -->
      <div class="flex items-center gap-3 flex-wrap">
        <VBadge :variant="incidentStatusVariant(data.status)" size="md" dot>
          {{ formatLabel(data.status) }}
        </VBadge>
        <VBadge :variant="incidentImpactVariant(data.impact)" size="md">
          {{ formatLabel(data.impact) }} impact
        </VBadge>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <div class="glass-card-static p-5 space-y-1">
          <p class="text-xs text-foreground-subtle uppercase tracking-wider">Created</p>
          <p class="text-sm font-semibold text-foreground">{{ formatDateTime(data.createdAt) }}</p>
        </div>
        <div class="glass-card-static p-5 space-y-1">
          <p class="text-xs text-foreground-subtle uppercase tracking-wider">Last Updated</p>
          <p class="text-sm font-semibold text-foreground">{{ formatRelativeTime(data.updatedAt || data.createdAt) }}</p>
        </div>
        <div class="glass-card-static p-5 space-y-1">
          <p class="text-xs text-foreground-subtle uppercase tracking-wider">Status Page</p>
          <p class="text-sm font-semibold text-foreground">{{ data.statusPageTitle || 'N/A' }}</p>
        </div>
      </div>

      <!-- Post Update -->
      <div class="glass-card-static p-4 sm:p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Post Update</h3>
        <form class="space-y-4" @submit.prevent="handlePostUpdate">
          <div class="grid sm:grid-cols-2 gap-4">
            <VSelect v-model="updateForm.status" label="New Status">
              <option v-for="s in INCIDENT_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
            </VSelect>
            <VSelect v-model="updateForm.impact" label="Impact">
              <option v-for="i in INCIDENT_IMPACTS" :key="i.value" :value="i.value">{{ i.label }}</option>
            </VSelect>
          </div>
          <VTextarea
            v-model="updateForm.message"
            label="Message"
            :rows="3"
            placeholder="Describe the update..."
          />
          <div class="flex justify-end">
            <VButton type="submit" size="sm" :loading="posting">
              <Send class="w-3.5 h-3.5" />
              Post Update
            </VButton>
          </div>
        </form>
      </div>

      <!-- Timeline -->
      <div class="glass-card-static overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-border-subtle">
          <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Update Timeline</h3>
        </div>

        <div v-if="data.updates?.length" class="p-4 sm:p-6 space-y-4">
          <div v-for="(update, i) in sortedUpdates" :key="i">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="mt-1 shrink-0">
                <div
                  class="w-2.5 h-2.5 rounded-full"
                  :class="incidentDotColor(update.status)"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <VBadge :variant="incidentStatusVariant(update.status)" size="sm">
                    {{ formatLabel(update.status) }}
                  </VBadge>
                  <span class="text-xs text-foreground-subtle">{{ formatDateTime(update.createdAt) }}</span>
                </div>
                <p class="mt-2 text-sm text-foreground-muted whitespace-pre-wrap">{{ update.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="px-4 sm:px-6 py-8 text-center text-sm text-foreground-subtle">
          No updates yet. Post the first update above.
        </div>
      </div>

      <!-- Affected Monitors -->
      <div v-if="data.affectedMonitors?.length" class="glass-card-static p-4 sm:p-6 space-y-4">
        <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Affected Monitors</h3>
        <div class="space-y-2">
          <div
            v-for="monitor in data.affectedMonitors"
            :key="monitor.id"
            class="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-surface-raised/50"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0 bg-foreground-subtle"
            />
            <span class="text-sm font-medium text-foreground">{{ monitor.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Dialog -->
    <VDialog v-model="showDelete" title="Delete Incident">
      <p class="text-sm text-foreground-muted">
        Are you sure you want to delete <strong class="text-foreground">{{ data?.title }}</strong>?
        This will permanently remove the incident and all updates.
      </p>
      <template #footer>
        <VButton variant="ghost" @click="showDelete = false">Cancel</VButton>
        <VButton variant="danger" :loading="deleting" @click="handleDelete">Delete</VButton>
      </template>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight, Trash2, Send } from 'lucide-vue-next'
import { INCIDENT_STATUSES, INCIDENT_IMPACTS } from '~~/shared/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const id = route.params.id as string
const { success, error } = useToast()
const { incidentStatusVariant, incidentImpactVariant } = useStatusColor()

const showDelete = ref(false)
const deleting = ref(false)
const posting = ref(false)

const { data, status, refresh } = await useFetch(`/api/incidents/${id}`)

const updateForm = reactive({
  status: (data.value as any)?.status || 'investigating',
  impact: (data.value as any)?.impact || 'minor',
  message: '',
})

// Update form status when data loads
watch(data, (val: any) => {
  if (val) {
    updateForm.status = val.status
    updateForm.impact = val.impact
  }
})

const sortedUpdates = computed(() => {
  const updates = (data.value as any)?.updates || []
  return [...updates].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

async function handlePostUpdate() {
  if (!updateForm.message.trim()) {
    error('Please enter a message')
    return
  }
  posting.value = true
  try {
    await $fetch(`/api/incidents/${id}`, {
      method: 'PUT',
      body: {
        status: updateForm.status,
        impact: updateForm.impact,
        message: updateForm.message,
      },
    })
    success('Update posted successfully')
    updateForm.message = ''
    await refresh()
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to post update')
  } finally {
    posting.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await $fetch(`/api/incidents/${id}`, { method: 'DELETE' })
    success('Incident deleted')
    navigateTo('/incidents')
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to delete')
    deleting.value = false
  }
}

function incidentDotColor(status: string) {
  switch (status) {
    case 'investigating': return 'bg-warning'
    case 'identified': return 'bg-warning'
    case 'monitoring': return 'bg-accent'
    case 'resolved': return 'bg-success'
    default: return 'bg-foreground-subtle'
  }
}

function formatLabel(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
</script>
