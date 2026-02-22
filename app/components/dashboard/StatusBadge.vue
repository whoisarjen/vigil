<template>
  <VBadge :variant="statusVariant" :dot="dot">
    {{ label || status }}
  </VBadge>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  status: string
  label?: string
  dot?: boolean
}>(), {
  dot: true,
})

const statusVariant = computed(() => {
  switch (props.status) {
    case 'success': return 'success' as const
    case 'failure': return 'danger' as const
    case 'timeout': return 'warning' as const
    case 'error': return 'danger' as const
    default: return 'default' as const
  }
})
</script>
