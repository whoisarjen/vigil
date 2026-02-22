<template>
  <div>
    <DashboardHeader>
      <template #title>Edit Monitor</template>
    </DashboardHeader>

    <div class="p-6 lg:p-8 max-w-2xl">
      <div v-if="monitor">
        <DashboardMonitorForm
          ref="formRef"
          :initial-data="monitor"
          is-edit
          @submit="handleUpdate"
        />
      </div>
      <div v-else-if="status === 'pending'" class="space-y-5 animate-pulse">
        <div class="h-10 rounded-md bg-surface-raised" />
        <div class="h-10 rounded-md bg-surface-raised" />
        <div class="grid grid-cols-2 gap-4">
          <div class="h-10 rounded-md bg-surface-raised" />
          <div class="h-10 rounded-md bg-surface-raised" />
        </div>
      </div>
      <div v-else class="glass-card p-12 text-center space-y-3" style="transform: none">
        <p class="text-lg font-semibold text-foreground">Monitor not found</p>
        <VButton variant="secondary" @click="navigateTo('/monitors')">Back to Monitors</VButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const route = useRoute()
const id = route.params.id as string
const { success, error } = useToast()
const formRef = ref()

const { data: monitor, status } = await useFetch(`/api/monitors/${id}`)

async function handleUpdate(data: Record<string, any>) {
  try {
    await $fetch(`/api/monitors/${id}`, { method: 'PUT', body: data })
    success('Monitor updated successfully')
    navigateTo(`/monitors/${id}`)
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to update monitor')
    formRef.value?.setLoading(false)
  }
}
</script>
