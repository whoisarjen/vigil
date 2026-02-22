<template>
  <div class="relative min-h-screen bg-background bg-dot-pattern flex items-center justify-center px-4 sm:px-6 overflow-hidden">
    <!-- Background glow -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

    <div class="relative w-full max-w-sm space-y-8 animate-fade-in-up">
      <!-- Logo -->
      <div class="text-center">
        <div class="flex justify-center mb-6">
          <Logo />
        </div>
        <h1 class="text-2xl font-bold text-foreground">Welcome back</h1>
        <p class="mt-2 text-sm text-foreground-muted">Sign in to monitor your cron jobs</p>
      </div>

      <!-- Google Sign In -->
      <div class="glass-card-static p-6 space-y-4 shadow-[0_0_60px_rgba(99,102,241,0.08)]">
        <a
          href="/api/auth/google"
          class="flex items-center justify-center gap-3 w-full h-11 bg-surface-overlay hover:bg-surface-raised text-foreground font-medium text-sm rounded-[var(--radius-md)] border border-border-subtle transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </a>
      </div>

      <!-- Back link -->
      <p class="text-center">
        <NuxtLink to="/" class="text-sm text-foreground-subtle hover:text-foreground-muted transition-colors">
          &larr; Back to home
        </NuxtLink>
      </p>

      <!-- Error message -->
      <div v-if="error" class="flex items-center justify-center gap-2 bg-danger-muted text-danger text-sm px-4 py-3 rounded-[var(--radius-md)]">
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Authentication failed. Please try again.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const route = useRoute()
const error = computed(() => route.query.error === 'auth')
</script>
