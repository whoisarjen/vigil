<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:opacity-50 disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      props.class,
    )"
    :disabled="disabled || loading"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  class?: string
}>(), {
  variant: 'primary',
  size: 'md',
})

const variants: Record<string, string> = {
  primary: 'bg-accent hover:bg-accent-light text-white shadow-lg shadow-accent/20 hover:shadow-accent/30',
  secondary: 'bg-surface-raised hover:bg-surface-overlay text-foreground border border-border',
  ghost: 'hover:bg-surface-raised text-foreground-muted hover:text-foreground',
  danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20',
  outline: 'border border-border hover:border-accent/40 text-foreground-muted hover:text-foreground bg-transparent',
}

const sizes: Record<string, string> = {
  sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
  md: 'h-10 px-4 text-sm rounded-[var(--radius-md)]',
  lg: 'h-12 px-6 text-base rounded-[var(--radius-md)]',
}
</script>
