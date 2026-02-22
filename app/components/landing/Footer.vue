<template>
  <footer class="border-t border-border-subtle/50 py-12 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid sm:grid-cols-3 gap-8">
        <!-- Brand -->
        <div class="space-y-3">
          <Logo />
          <p class="text-sm text-foreground-subtle max-w-xs">
            Open source cron monitoring with Statuspage & BetterUptime integration.
          </p>
        </div>

        <!-- Product -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-foreground">Product</h4>
          <div class="space-y-2">
            <a href="#features" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors">Features</a>
            <a href="#pricing" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors">Pricing</a>
          </div>
        </div>

        <!-- Community -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-foreground">Community</h4>
          <div class="space-y-2">
            <a href="https://github.com" target="_blank" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors">GitHub</a>
            <a href="/CONTRIBUTING.md" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors">Contributing</a>
            <a href="/LICENSE" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors">License</a>
          </div>
        </div>
      </div>

      <div class="mt-10 pt-6 border-t border-border-subtle/30 text-center">
        <p class="text-xs text-foreground-subtle">&copy; {{ new Date().getFullYear() }} Vigil. Open source under MIT License.</p>
      </div>
    </div>
  </footer>
</template>
