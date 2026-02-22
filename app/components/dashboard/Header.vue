<template>
  <header class="sticky top-0 z-30 h-16 border-b border-border-subtle/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-8">
    <div class="flex items-center gap-4">
      <!-- Mobile menu button -->
      <button
        class="lg:hidden text-foreground-muted hover:text-foreground p-1.5 -ml-1.5"
        @click="sidebarOpen = true"
      >
        <Menu class="w-5 h-5" />
      </button>

      <h1 class="text-lg font-semibold text-foreground">
        <slot name="title">Dashboard</slot>
      </h1>
    </div>

    <div class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

const sidebarOpen = inject<Ref<boolean>>('sidebarOpen', ref(false))
</script>
