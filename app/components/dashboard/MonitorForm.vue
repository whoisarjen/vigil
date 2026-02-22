<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <!-- Basic Settings -->
    <div class="space-y-5">
      <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Basic Settings</h3>

      <VInput
        v-model="form.name"
        label="Monitor Name"
        placeholder="e.g. API Health Check"
        :error="errors.name"
      />

      <VInput
        v-model="form.url"
        label="URL"
        placeholder="https://api.example.com/health"
        :error="errors.url"
      />

      <div class="grid sm:grid-cols-2 gap-4">
        <VSelect v-model="form.method" label="HTTP Method">
          <option v-for="m in HTTP_METHODS" :key="m" :value="m">{{ m }}</option>
        </VSelect>

        <VInput
          v-model="form.expectedStatus"
          label="Expected Status Code"
          type="number"
          placeholder="200"
        />
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <VSelect v-model="form.timeoutMs" label="Timeout">
          <option v-for="t in TIMEOUT_OPTIONS" :key="t.value" :value="t.value">{{ t.label }}</option>
        </VSelect>

        <VSelect v-model="form.scheduleInterval" label="Check Interval">
          <option v-for="s in SCHEDULE_INTERVALS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </VSelect>
      </div>

      <div class="flex items-center justify-between py-2">
        <div>
          <p class="text-sm font-medium text-foreground">Enabled</p>
          <p class="text-xs text-foreground-subtle">Monitor will be checked on schedule</p>
        </div>
        <VToggle v-model="form.enabled" />
      </div>
    </div>

    <!-- Advanced Settings -->
    <div class="space-y-5">
      <button
        type="button"
        class="flex items-center gap-2 text-sm font-semibold text-foreground-muted uppercase tracking-wider hover:text-foreground transition-colors"
        @click="showAdvanced = !showAdvanced"
      >
        <ChevronRight class="w-4 h-4 transition-transform" :class="showAdvanced && 'rotate-90'" />
        Advanced Settings
      </button>

      <div v-if="showAdvanced" class="space-y-5 animate-fade-in">
        <!-- Headers -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-foreground-muted">Custom Headers</label>
          <div v-for="(header, i) in headers" :key="i" class="flex items-center gap-2">
            <VInput v-model="header.key" placeholder="Header name" />
            <VInput v-model="header.value" placeholder="Value" />
            <button
              type="button"
              class="p-2 text-foreground-subtle hover:text-danger transition-colors"
              @click="headers.splice(i, 1)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          <VButton type="button" variant="ghost" size="sm" @click="headers.push({ key: '', value: '' })">
            <Plus class="w-3.5 h-3.5" />
            Add Header
          </VButton>
        </div>

        <!-- Body (only for POST/PUT/PATCH) -->
        <div v-if="['POST', 'PUT', 'PATCH'].includes(form.method)">
          <VTextarea
            v-model="form.body"
            label="Request Body"
            :rows="4"
            placeholder='{"key": "value"}'
            class="font-mono"
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between pt-4 border-t border-border-subtle">
      <VButton type="button" variant="ghost" @click="navigateTo('/monitors')">
        Cancel
      </VButton>
      <VButton type="submit" :loading="loading">
        {{ isEdit ? 'Save Changes' : 'Create Monitor' }}
      </VButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ChevronRight, Plus, Trash2 } from 'lucide-vue-next'
import { SCHEDULE_INTERVALS, HTTP_METHODS, TIMEOUT_OPTIONS } from '~~/shared/types'

const props = defineProps<{
  initialData?: Record<string, any>
  isEdit?: boolean
}>()

const emit = defineEmits<{
  submit: [data: Record<string, any>]
}>()

const loading = ref(false)
const showAdvanced = ref(false)
const errors = ref<Record<string, string>>({})

const headers = ref<{ key: string; value: string }[]>(
  props.initialData?.headers
    ? Object.entries(props.initialData.headers).map(([key, value]) => ({ key, value: value as string }))
    : [],
)

const form = reactive({
  name: props.initialData?.name || '',
  url: props.initialData?.url || '',
  method: props.initialData?.method || 'GET',
  expectedStatus: props.initialData?.expectedStatus || 200,
  timeoutMs: props.initialData?.timeoutMs || 5000,
  scheduleInterval: props.initialData?.scheduleInterval || 15,
  enabled: props.initialData?.enabled ?? true,
  body: props.initialData?.body || '',
})

// Show sections if data exists
if (props.initialData?.body || headers.value.length) showAdvanced.value = true

async function handleSubmit() {
  errors.value = {}

  // Basic validation
  if (!form.name.trim()) { errors.value.name = 'Name is required'; return }
  if (!form.url.trim()) { errors.value.url = 'URL is required'; return }
  try { new URL(form.url) } catch { errors.value.url = 'Must be a valid URL'; return }

  // Build headers object
  const headersObj: Record<string, string> = {}
  for (const h of headers.value) {
    if (h.key.trim()) headersObj[h.key.trim()] = h.value
  }

  loading.value = true
  emit('submit', {
    name: form.name,
    url: form.url,
    method: form.method,
    expectedStatus: Number(form.expectedStatus),
    timeoutMs: Number(form.timeoutMs),
    scheduleInterval: Number(form.scheduleInterval),
    enabled: form.enabled,
    headers: headersObj,
    body: form.body || null,
  })
}

defineExpose({ setLoading: (v: boolean) => { loading.value = v } })
</script>
