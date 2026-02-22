<template>
  <section class="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
    <!-- Background glow -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />

    <div class="relative max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
      <!-- Pill Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-xs font-medium text-accent-light">
        <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        Open Source Status Page
      </div>

      <!-- Heading -->
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
        <span class="text-foreground">Your Status Page</span>
        <br />
        <span class="gradient-text">Open Source & Free</span>
      </h1>

      <!-- Subheading -->
      <p class="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed">
        The open source alternative to Statuspage and BetterUptime. Monitor your services, track incidents, and share a beautiful public status page — all for free.
      </p>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <VButton size="lg" @click="navigateTo('/sign-in')">
          Start For Free
        </VButton>
        <VButton variant="outline" size="lg">
          <Github class="w-4 h-4" />
          View on GitHub
        </VButton>
      </div>
    </div>

    <!-- Dashboard Mockup -->
    <div class="relative mt-16 sm:mt-20 w-full max-w-5xl mx-auto animate-fade-in-up" style="animation-delay: 200ms">
      <!-- Glow behind mockup -->
      <div class="absolute -inset-4 bg-accent/5 rounded-[var(--radius-xl)] blur-2xl pointer-events-none" />

      <div class="relative glass-card overflow-hidden p-1" style="transform: none">
        <!-- Fake browser bar -->
        <div class="flex items-center gap-2 px-4 py-3 border-b border-border-subtle/50">
          <div class="flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-danger/60" />
            <div class="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div class="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <div class="flex-1 mx-4">
            <div class="max-w-xs mx-auto h-5 bg-surface-raised rounded-[var(--radius-sm)] flex items-center justify-center">
              <span class="text-[10px] text-foreground-subtle font-mono">vigil.dev/dashboard</span>
            </div>
          </div>
        </div>

        <!-- Fake Dashboard Content -->
        <div class="p-6 space-y-4">
          <!-- Stats Row -->
          <div class="grid grid-cols-4 gap-3">
            <div v-for="stat in mockStats" :key="stat.label" class="bg-surface/60 rounded-[var(--radius-md)] p-3 border border-border-subtle/30">
              <p class="text-[10px] text-foreground-subtle uppercase tracking-wider">{{ stat.label }}</p>
              <p class="text-lg font-bold mt-0.5" :class="stat.color">{{ stat.value }}</p>
            </div>
          </div>

          <!-- Monitor Rows -->
          <div class="space-y-2">
            <div
              v-for="monitor in mockMonitors"
              :key="monitor.name"
              class="flex items-center justify-between bg-surface/40 rounded-[var(--radius-md)] px-4 py-3 border border-border-subtle/20"
            >
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full" :class="monitor.dotColor" />
                <span class="text-sm font-medium text-foreground">{{ monitor.name }}</span>
                <span class="text-xs font-mono text-foreground-subtle hidden sm:inline">{{ monitor.url }}</span>
              </div>
              <div class="flex items-center gap-4">
                <!-- Mini uptime bars -->
                <div class="hidden sm:flex items-end gap-0.5 h-4">
                  <div
                    v-for="(bar, i) in monitor.bars"
                    :key="i"
                    class="w-1 rounded-full"
                    :class="bar.color"
                    :style="{ height: bar.height }"
                  />
                </div>
                <span class="text-xs font-mono" :class="monitor.timeColor">{{ monitor.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Github } from 'lucide-vue-next'

const mockStats = [
  { label: 'Monitors', value: '4 / 5', color: 'text-foreground' },
  { label: 'Uptime', value: '99.7%', color: 'text-success' },
  { label: 'Checks Today', value: '384', color: 'text-foreground' },
  { label: 'Incidents', value: '1', color: 'text-warning' },
]

function generateBars() {
  return Array.from({ length: 20 }, () => {
    const isSuccess = Math.random() > 0.1
    return {
      color: isSuccess ? 'bg-success' : 'bg-danger',
      height: `${Math.floor(Math.random() * 60 + 40)}%`,
    }
  })
}

const mockMonitors = [
  { name: 'API Health Check', url: 'api.example.com/health', dotColor: 'bg-success', time: '142ms', timeColor: 'text-success', bars: generateBars() },
  { name: 'Payment Webhook', url: 'pay.example.com/hook', dotColor: 'bg-success', time: '89ms', timeColor: 'text-success', bars: generateBars() },
  { name: 'Email Service', url: 'mail.example.com/ping', dotColor: 'bg-warning', time: '3.2s', timeColor: 'text-warning', bars: generateBars() },
  { name: 'Database Backup', url: 'db.example.com/backup', dotColor: 'bg-success', time: '267ms', timeColor: 'text-success', bars: generateBars() },
]
</script>
