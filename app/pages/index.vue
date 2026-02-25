<template>
  <div class="min-h-screen bg-background">
    <div class="bg-dot-pattern">
      <LandingNavbar />
      <LandingHero />
    </div>
    <LandingFeatures />
    <LandingHowItWorks />
    <LandingPricing />
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  script: [
    { src: 'https://beamback.whoisarjen.com/widget.js', 'data-api-key': 'ak_SYq_uwihrIIGnNvPV2sS4', defer: true },
  ],
})
</script>
