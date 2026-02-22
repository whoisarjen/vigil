<template>
  <span
    :class="cn(
      'inline-flex items-center gap-1 font-medium',
      variants[variant],
      sizes[size],
      pill && 'rounded-full',
      !pill && 'rounded-[var(--radius-sm)]',
      props.class,
    )"
  >
    <span
      v-if="dot"
      :class="cn('w-1.5 h-1.5 rounded-full', dotColors[variant])"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent'
  size?: 'sm' | 'md'
  dot?: boolean
  pill?: boolean
  class?: string
}>(), {
  variant: 'default',
  size: 'sm',
})

const variants: Record<string, string> = {
  default: 'bg-surface-raised text-foreground-muted border border-border-subtle',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  accent: 'bg-accent/10 text-accent-light',
}

const dotColors: Record<string, string> = {
  default: 'bg-foreground-subtle',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  accent: 'bg-accent',
}

const sizes: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}
</script>
