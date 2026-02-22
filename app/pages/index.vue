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
</script>
