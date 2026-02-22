<template>
  <section id="pricing" class="py-20 sm:py-28 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12 sm:mb-16 space-y-4">
        <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">
          Simple, <span class="gradient-text">transparent</span> pricing
        </h2>
        <p class="text-foreground-muted max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto stagger">
        <!-- Free Plan -->
        <div class="glass-card p-6 sm:p-8 flex flex-col" style="transform: none">
          <div>
            <h3 class="text-lg font-semibold text-foreground">Free</h3>
            <div class="mt-3 flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-foreground">$0</span>
              <span class="text-foreground-muted text-sm">/forever</span>
            </div>
          </div>
          <ul class="mt-6 space-y-3 flex-1">
            <li v-for="f in freePlanFeatures" :key="f" class="flex items-start gap-2.5 text-sm text-foreground-muted">
              <Check class="w-4 h-4 text-success shrink-0 mt-0.5" />
              {{ f }}
            </li>
          </ul>
          <VButton class="w-full mt-6" @click="navigateTo('/sign-in')">
            Get Started
          </VButton>
        </div>

        <!-- Pro Plan -->
        <div class="relative glass-card p-6 sm:p-8 flex flex-col gradient-border" style="transform: none">
          <!-- Coming Soon badge -->
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <VBadge variant="accent" pill>Coming Soon</VBadge>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-foreground">Pro</h3>
            <div class="mt-3 flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-foreground">$9</span>
              <span class="text-foreground-muted text-sm">/month</span>
            </div>
          </div>
          <ul class="mt-6 space-y-3 flex-1">
            <li v-for="f in proPlanFeatures" :key="f" class="flex items-start gap-2.5 text-sm text-foreground-muted">
              <Check class="w-4 h-4 text-accent-light shrink-0 mt-0.5" />
              {{ f }}
            </li>
          </ul>
          <VButton variant="secondary" class="w-full mt-6" disabled>
            Join Waitlist
          </VButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const freePlanFeatures = [
  'Up to 5 monitors',
  '7-day history retention',
  '15-minute check intervals',
  'Public status page',
  'Incident management',
  'Community support',
]

const proPlanFeatures = [
  'Up to 50 monitors',
  '90-day history retention',
  '1-minute check intervals',
  'All Free features',
  'Custom status page domain',
  'Priority support',
  'Slack & Discord notifications',
]
</script>
