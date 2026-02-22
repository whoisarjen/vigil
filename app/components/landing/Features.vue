<template>
  <section id="features" class="py-24 sm:py-32 px-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-16 space-y-4">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">
          Everything you need to
          <span class="gradient-text">stay informed</span>
        </h2>
        <p class="text-foreground-muted max-w-xl mx-auto text-lg">
          Everything you need to keep users informed about your service health.
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="glass-card p-8 space-y-4"
        >
          <div class="relative w-12 h-12 rounded-[var(--radius-lg)] bg-accent/10 flex items-center justify-center">
            <div class="absolute inset-0 rounded-[var(--radius-lg)] bg-accent/5 blur-lg pointer-events-none" />
            <component :is="feature.icon" class="relative w-5 h-5 text-accent-light" />
          </div>
          <h3 class="text-base font-semibold text-foreground">{{ feature.title }}</h3>
          <p class="text-sm text-foreground-muted leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Zap, Globe, AlertTriangle, BarChart3, Clock, Code2 } from 'lucide-vue-next'

const features = [
  {
    icon: Zap,
    title: 'Instant Alerts',
    description: 'Know immediately when a cron job fails, times out, or returns an unexpected response.',
  },
  {
    icon: Globe,
    title: 'Public Status Page',
    description: 'Share a beautiful public status page with your users. Real-time service health, uptime history, and incident timeline.',
  },
  {
    icon: AlertTriangle,
    title: 'Incident Management',
    description: 'Create and track incidents with timeline updates. Automatic or manual incident creation when monitors detect issues.',
  },
  {
    icon: BarChart3,
    title: 'Visual Timeline',
    description: 'See 7 days of check history with response times and status codes at a glance.',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Monitor every 15 minutes, hourly, or daily — you choose the interval that fits.',
  },
  {
    icon: Code2,
    title: 'Open Source',
    description: 'Fully open source and self-hostable. Inspect every line of code. No vendor lock-in.',
  },
]
</script>
