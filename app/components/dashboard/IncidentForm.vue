<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <!-- Basic Settings -->
    <div class="space-y-5">
      <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Incident Details</h3>

      <VSelect
        v-model="form.statusPageId"
        label="Status Page"
        placeholder="Select a status page"
        :error="errors.statusPageId"
        :disabled="isEdit"
      >
        <option v-for="sp in statusPages" :key="sp.id" :value="sp.id">{{ sp.title }}</option>
      </VSelect>

      <VInput
        v-model="form.title"
        label="Title"
        placeholder="e.g. API Degraded Performance"
        :error="errors.title"
      />

      <div class="grid sm:grid-cols-2 gap-4">
        <VSelect v-model="form.status" label="Status">
          <option v-for="s in INCIDENT_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
        </VSelect>

        <VSelect v-model="form.impact" label="Impact">
          <option v-for="i in INCIDENT_IMPACTS" :key="i.value" :value="i.value">{{ i.label }}</option>
        </VSelect>
      </div>

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-foreground-muted">Message</label>
        <textarea
          v-model="form.message"
          rows="4"
          placeholder="Describe the current situation..."
          class="w-full bg-surface border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 resize-none"
        />
        <p v-if="errors.message" class="text-xs text-danger">{{ errors.message }}</p>
      </div>
    </div>

    <!-- Affected Monitors -->
    <div class="space-y-5">
      <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Affected Monitors</h3>
      <p class="text-xs text-foreground-subtle -mt-3">Select which monitors are affected by this incident.</p>

      <div v-if="!form.statusPageId" class="text-sm text-foreground-subtle py-4 text-center">
        Select a status page above to see its monitors.
      </div>

      <div v-else-if="pageMonitorsLoading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="flex items-center gap-3 animate-pulse">
          <div class="w-4 h-4 rounded bg-surface-raised" />
          <div class="h-4 w-40 rounded bg-surface-raised" />
        </div>
      </div>

      <div v-else-if="pageMonitors.length" class="space-y-2">
        <label
          v-for="monitor in pageMonitors"
          :key="monitor.id"
          class="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-border-subtle hover:border-border cursor-pointer transition-colors"
          :class="form.monitorIds.includes(monitor.id) && 'border-accent/30 bg-accent/5'"
        >
          <input
            type="checkbox"
            :value="monitor.id"
            :checked="form.monitorIds.includes(monitor.id)"
            class="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent/30 cursor-pointer"
            @change="toggleMonitor(monitor.id)"
          />
          <span class="text-sm font-medium text-foreground">{{ monitor.name }}</span>
        </label>
      </div>

      <div v-else class="text-sm text-foreground-subtle py-4 text-center">
        No monitors on this status page.
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between pt-4 border-t border-border-subtle">
      <VButton type="button" variant="ghost" @click="navigateTo('/incidents')">
        Cancel
      </VButton>
      <VButton type="submit" :loading="loading">
        {{ isEdit ? 'Save Changes' : 'Create Incident' }}
      </VButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { INCIDENT_STATUSES, INCIDENT_IMPACTS } from '~~/shared/types'

const props = defineProps<{
  initialData?: Record<string, any>
  isEdit?: boolean
}>()

const emit = defineEmits<{
  submit: [data: Record<string, any>]
}>()

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const form = reactive({
  statusPageId: props.initialData?.statusPageId || '',
  title: props.initialData?.title || '',
  status: props.initialData?.status || 'investigating',
  impact: props.initialData?.impact || 'minor',
  message: props.initialData?.message || '',
  monitorIds: (props.initialData?.monitorIds || []) as string[],
})

// Fetch status pages
const { data: statusPagesData } = await useFetch('/api/status-pages')
const statusPages = computed(() => (statusPagesData.value as any[] | null) || [])

// Fetch monitors for selected status page
const pageMonitors = ref<any[]>([])
const pageMonitorsLoading = ref(false)

async function fetchPageMonitors(statusPageId: string) {
  if (!statusPageId) {
    pageMonitors.value = []
    return
  }
  pageMonitorsLoading.value = true
  try {
    const data = await $fetch(`/api/status-pages/${statusPageId}`) as any
    // The status page detail returns monitorIds; also fetch monitors list
    const allMonitors = await $fetch('/api/monitors') as any[]
    const monitorIds = data.monitorIds || []
    pageMonitors.value = allMonitors.filter((m: any) => monitorIds.includes(m.id))
  } catch {
    pageMonitors.value = []
  } finally {
    pageMonitorsLoading.value = false
  }
}

// Watch status page selection
watch(
  () => form.statusPageId,
  (val) => {
    if (!props.isEdit) {
      form.monitorIds = []
    }
    fetchPageMonitors(val)
  },
  { immediate: true },
)

function toggleMonitor(id: string) {
  const index = form.monitorIds.indexOf(id)
  if (index >= 0) {
    form.monitorIds.splice(index, 1)
  } else {
    form.monitorIds.push(id)
  }
}

async function handleSubmit() {
  errors.value = {}

  if (!form.statusPageId) { errors.value.statusPageId = 'Status page is required'; return }
  if (!form.title.trim()) { errors.value.title = 'Title is required'; return }
  if (!form.message.trim()) { errors.value.message = 'Message is required'; return }

  loading.value = true
  emit('submit', { ...form })
}

defineExpose({ setLoading: (v: boolean) => { loading.value = v } })
</script>
