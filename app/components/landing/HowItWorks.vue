<template>
  <section class="py-20 sm:py-28 px-4 sm:px-6 bg-surface/30">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12 sm:mb-16 space-y-4">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">
          How it <span class="gradient-text">works</span>
        </h2>
        <p class="text-foreground-muted max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
          Get started in under a minute.
        </p>
      </div>

      <div class="relative grid md:grid-cols-3 gap-10 md:gap-8 stagger">
        <!-- Desktop connector lines between steps -->
        <div class="hidden md:block absolute top-7 left-[calc(16.67%+36px)] right-[calc(83.33%-36px+8px)] h-px bg-gradient-to-r from-accent/20 to-accent/10" aria-hidden="true" />
        <div class="hidden md:block absolute top-7 left-[calc(50%+36px)] right-[calc(16.67%+36px)] h-px bg-gradient-to-r from-accent/15 to-accent/5" aria-hidden="true" />

        <div v-for="step in steps" :key="step.number" class="relative text-center flex flex-col items-center gap-4">
          <!-- Number -->
          <div class="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-lg animate-pulse-glow">
            {{ step.number }}
          </div>
          <h3 class="text-lg font-semibold text-foreground">{{ step.title }}</h3>
          <p class="text-sm text-foreground-muted leading-relaxed max-w-xs">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    number: 1,
    title: 'Create a Monitor',
    description: 'Add your endpoint URL, choose the HTTP method, and set your expected response code.',
  },
  {
    number: 2,
    title: 'We Check on Schedule',
    description: 'Vigil hits your endpoint on schedule and records the response time, status, and any errors.',
  },
  {
    number: 3,
    title: 'Share Your Status',
    description: 'Your public status page updates in real-time. Users see current status, uptime history, and incident timeline.',
  },
]
</script>
