<template>
  <nav class="fixed top-0 inset-x-0 z-50 h-16 border-b border-border-subtle/50">
    <div class="absolute inset-0 bg-background/80 backdrop-blur-xl" />
    <div class="relative max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
      <!-- Logo -->
      <Logo />

      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#features" class="text-sm text-foreground-muted hover:text-foreground transition-colors">Features</a>
        <a href="#pricing" class="text-sm text-foreground-muted hover:text-foreground transition-colors">Pricing</a>
        <a href="https://github.com" target="_blank" class="text-sm text-foreground-muted hover:text-foreground transition-colors">GitHub</a>
      </div>

      <!-- Desktop Auth -->
      <div class="hidden md:flex items-center gap-3">
        <VButton variant="ghost" size="sm" @click="navigateTo('/sign-in')">
          Sign In
        </VButton>
        <VButton size="sm" @click="navigateTo('/sign-in')">
          Get Started
        </VButton>
      </div>

      <!-- Mobile Menu Button -->
      <button
        class="md:hidden text-foreground-muted hover:text-foreground p-2"
        @click="menuOpen = !menuOpen"
      >
        <svg v-if="!menuOpen" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-150"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="menuOpen" class="md:hidden absolute top-16 inset-x-0 bg-surface border-b border-border p-4 space-y-4">
        <a href="#features" class="block text-sm text-foreground-muted hover:text-foreground" @click="menuOpen = false">Features</a>
        <a href="#pricing" class="block text-sm text-foreground-muted hover:text-foreground" @click="menuOpen = false">Pricing</a>
        <a href="https://github.com" target="_blank" class="block text-sm text-foreground-muted hover:text-foreground">GitHub</a>
        <div class="pt-2 border-t border-border-subtle">
          <VButton class="w-full" size="sm" @click="navigateTo('/sign-in')">Get Started</VButton>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
const menuOpen = ref(false)
</script>
