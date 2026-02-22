<template>
  <div>
    <DashboardHeader>
      <template #title>New Incident</template>
    </DashboardHeader>

    <div class="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <DashboardIncidentForm ref="formRef" @submit="handleCreate" />
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
    await $fetch('/api/incidents', { method: 'POST', body: data })
    success('Incident created successfully')
    navigateTo('/incidents')
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to create incident')
    formRef.value?.setLoading(false)
  }
}
</script>
