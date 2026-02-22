<template>
  <div>
    <DashboardHeader>
      <template #title>New Monitor</template>
    </DashboardHeader>

    <div class="p-6 lg:p-8 max-w-2xl">
      <DashboardMonitorForm ref="formRef" @submit="handleCreate" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { success, error } = useToast()
const formRef = ref()

async function handleCreate(data: Record<string, any>) {
  try {
    await $fetch('/api/monitors', { method: 'POST', body: data })
    success('Monitor created successfully')
    navigateTo('/monitors')
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to create monitor')
    formRef.value?.setLoading(false)
  }
}
</script>
