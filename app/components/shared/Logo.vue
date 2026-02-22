<template>
  <NuxtLink to="/" class="flex items-center gap-2.5 group">
    <!-- Icon -->
    <div class="relative w-8 h-8 flex items-center justify-center">
      <svg viewBox="0 0 32 32" class="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" class="fill-accent/10" />
        <path d="M8 10L16 24L24 10" stroke="url(#vigil-gradient)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6 16H12L14 13L18 19L20 16H26" stroke="url(#vigil-gradient-2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
        <defs>
          <linearGradient id="vigil-gradient" x1="8" y1="10" x2="24" y2="10" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6366f1" />
            <stop offset="1" stop-color="#a855f7" />
          </linearGradient>
          <linearGradient id="vigil-gradient-2" x1="6" y1="16" x2="26" y2="16" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6366f1" />
            <stop offset="1" stop-color="#a855f7" />
          </linearGradient>
        </defs>
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
