<template>
  <header class="sticky top-0 z-30 h-16 border-b border-border-subtle/50 bg-background/80 backdrop-blur-xl flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <!-- Mobile menu button -->
      <button
        class="lg:hidden text-foreground-muted hover:text-foreground p-1.5 -ml-1.5 shrink-0"
        @click="sidebarOpen = true"
      >
        <Menu class="w-5 h-5" />
      </button>

      <h1 class="text-lg font-semibold text-foreground min-w-0 truncate">
        <slot name="title">Dashboard</slot>
      </h1>
    </div>

    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

const sidebarOpen = inject<Ref<boolean>>('sidebarOpen', ref(false))
</script>
