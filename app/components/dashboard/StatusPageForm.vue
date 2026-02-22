<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <!-- Basic Settings -->
    <div class="space-y-5">
      <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Status Page Settings</h3>

      <VInput
        v-model="form.title"
        label="Title"
        placeholder="e.g. Acme Status"
        :error="errors.title"
      />

      <VInput
        v-model="form.slug"
        label="Slug"
        placeholder="e.g. acme-status"
        :error="errors.slug"
        :hint="`Public URL: ${baseUrl}/status/${form.slug || 'your-slug'}`"
      />

      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-foreground-muted">Description</label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="A brief description shown on your status page"
          class="w-full bg-surface border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 resize-none"
        />
      </div>

      <div class="flex items-center justify-between py-2">
        <div>
          <p class="text-sm font-medium text-foreground">Public</p>
          <p class="text-xs text-foreground-subtle">Make this status page accessible to anyone with the link</p>
        </div>
        <VToggle v-model="form.isPublic" />
      </div>
    </div>

    <!-- Monitor Selection -->
    <div class="space-y-5">
      <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Monitors</h3>
      <p class="text-xs text-foreground-subtle -mt-3">Select which monitors to display on this status page.</p>

      <div v-if="monitorsLoading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="flex items-center gap-3 animate-pulse">
          <div class="w-4 h-4 rounded bg-surface-raised" />
          <div class="h-4 w-40 rounded bg-surface-raised" />
        </div>
      </div>

      <div v-else-if="monitors.length" class="space-y-2">
        <label
          v-for="monitor in monitors"
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
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ monitor.name }}</p>
            <p class="text-xs text-foreground-subtle truncate">{{ monitor.url }}</p>
          </div>
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :class="getStatusDotColor(monitor.latestStatus)"
          />
        </label>
      </div>

      <div v-else class="text-sm text-foreground-subtle py-4 text-center">
        No monitors found. <NuxtLink to="/monitors/new" class="text-accent-light hover:underline">Create one first.</NuxtLink>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between pt-4 border-t border-border-subtle">
      <VButton type="button" variant="ghost" @click="navigateTo('/status-pages')">
        Cancel
      </VButton>
      <VButton type="submit" :loading="loading">
        {{ isEdit ? 'Save Changes' : 'Create Status Page' }}
      </VButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { MonitorWithLatest } from '~~/shared/types'

const props = defineProps<{
  initialData?: Record<string, any>
  isEdit?: boolean
}>()

const emit = defineEmits<{
  submit: [data: Record<string, any>]
}>()

const loading = ref(false)
const errors = ref<Record<string, string>>({})

const runtimeConfig = useRuntimeConfig()
const baseUrl = computed(() => {
  if (import.meta.client) return window.location.origin
  return runtimeConfig.public?.siteUrl || 'https://yoursite.com'
})

const form = reactive({
  title: props.initialData?.title || '',
  slug: props.initialData?.slug || '',
  description: props.initialData?.description || '',
  isPublic: props.initialData?.isPublic ?? true,
  monitorIds: (props.initialData?.monitorIds || []) as string[],
})

// Fetch monitors
const { data: monitorsData, status: monitorsStatus } = await useFetch('/api/monitors')
const monitors = computed(() => (monitorsData.value as MonitorWithLatest[] | null) || [])
const monitorsLoading = computed(() => monitorsStatus.value === 'pending')

function toggleMonitor(id: string) {
  const index = form.monitorIds.indexOf(id)
  if (index >= 0) {
    form.monitorIds.splice(index, 1)
  } else {
    form.monitorIds.push(id)
  }
}

// Auto-generate slug from title
watch(
  () => form.title,
  (val) => {
    if (!props.isEdit) {
      form.slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
  },
)

async function handleSubmit() {
  errors.value = {}

  if (!form.title.trim()) { errors.value.title = 'Title is required'; return }
  if (!form.slug.trim()) { errors.value.slug = 'Slug is required'; return }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(form.slug)) {
    errors.value.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    return
  }

  loading.value = true
  emit('submit', { ...form })
}

defineExpose({ setLoading: (v: boolean) => { loading.value = v } })
</script>
