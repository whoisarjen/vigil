<template>
  <NuxtLink to="/" class="flex items-center gap-2.5 group">
    <!-- Icon -->
    <div class="relative w-8 h-8 flex items-center justify-center">
      <svg viewBox="0 0 32 32" class="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vigil-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6366f1" />
            <stop offset="1" stop-color="#a855f7" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#vigil-bg)" />
        <path d="M6 16.5H11L13.5 11L16 21L18.5 11L21 16.5H26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <!-- Text -->
    <span
      v-if="!iconOnly"
      class="text-lg font-bold tracking-tight text-foreground group-hover:text-accent-light transition-colors"
    >
      Vigil
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  iconOnly?: boolean
}>()
</script>
