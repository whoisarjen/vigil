<template>
  <div>
    <DashboardHeader>
      <template #title>New Status Page</template>
    </DashboardHeader>

    <div class="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <DashboardStatusPageForm ref="formRef" @submit="handleCreate" />
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
    await $fetch('/api/status-pages', { method: 'POST', body: data })
    success('Status page created successfully')
    navigateTo('/status-pages')
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to create status page')
    formRef.value?.setLoading(false)
  }
}
</script>
