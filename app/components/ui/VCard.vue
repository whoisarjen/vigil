<template>
  <div
    :class="cn(
      hoverable
        ? 'glass-card cursor-pointer'
        : 'glass-card-static',
      glow && 'glow-sm',
      props.class,
    )"
  >
    <div v-if="$slots.header" class="px-6 py-4 border-b border-border-subtle">
      <slot name="header" />
    </div>
    <div :class="cn('p-6', noPadding && 'p-0')">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-border-subtle">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  hoverable?: boolean
  glow?: boolean
  noPadding?: boolean
  class?: string
}>()
</script>
