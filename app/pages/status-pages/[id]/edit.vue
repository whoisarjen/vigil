<template>
  <div>
    <DashboardHeader>
      <template #title>
        <div class="flex items-center gap-3 min-w-0">
          <NuxtLink to="/status-pages" class="text-foreground-subtle hover:text-accent-light transition-colors shrink-0">
            Status Pages
          </NuxtLink>
          <ChevronRight class="w-4 h-4 text-foreground-subtle shrink-0" />
          <span class="truncate">{{ pageData?.title || 'Edit' }}</span>
        </div>
      </template>
      <template #actions>
        <VButton variant="danger" size="sm" @click="showDelete = true">
          <Trash2 class="w-3.5 h-3.5" />
          Delete
        </VButton>
      </template>
    </DashboardHeader>

    <div class="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div v-if="pageData">
        <DashboardStatusPageForm
          ref="formRef"
          :initial-data="pageData"
          is-edit
          @submit="handleUpdate"
        />
      </div>
      <div v-else-if="status === 'pending'" class="space-y-5 animate-pulse">
        <div class="h-10 rounded-md bg-surface-raised" />
        <div class="h-10 rounded-md bg-surface-raised" />
        <div class="h-20 rounded-md bg-surface-raised" />
        <div class="h-10 rounded-md bg-surface-raised" />
      </div>
      <div v-else class="glass-card-static p-12 text-center space-y-3">
        <p class="text-lg font-semibold text-foreground">Status page not found</p>
        <VButton variant="secondary" @click="navigateTo('/status-pages')">Back to Status Pages</VButton>
      </div>
    </div>

    <!-- Delete Dialog -->
    <VDialog v-model="showDelete" title="Delete Status Page">
      <p class="text-sm text-foreground-muted">
        Are you sure you want to delete <strong class="text-foreground">{{ pageData?.title }}</strong>?
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
import { ChevronRight, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const id = route.params.id as string
const { success, error } = useToast()
const formRef = ref()

const showDelete = ref(false)
const deleting = ref(false)

const { data: pageData, status } = await useFetch(`/api/status-pages/${id}`)

async function handleUpdate(data: Record<string, any>) {
  try {
    await $fetch(`/api/status-pages/${id}`, { method: 'PUT', body: data })
    success('Status page updated successfully')
    navigateTo('/status-pages')
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to update status page')
    formRef.value?.setLoading(false)
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await $fetch(`/api/status-pages/${id}`, { method: 'DELETE' })
    success('Status page deleted')
    showDelete.value = false
    navigateTo('/status-pages')
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to delete')
  } finally {
    deleting.value = false
  }
}
</script>
