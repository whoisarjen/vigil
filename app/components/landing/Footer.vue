<template>
  <footer class="border-t border-border-subtle/50 py-12 sm:py-16 px-4 sm:px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-8">
        <!-- Brand — spans 2 cols on mobile, 2 cols on sm+ -->
        <div class="col-span-2 space-y-3">
          <Logo />
          <p class="text-sm text-foreground-subtle max-w-xs leading-relaxed">
            The open source alternative to Statuspage and BetterUptime.
          </p>
        </div>

        <!-- Product -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-foreground">Product</h4>
          <div class="space-y-2.5">
            <a href="#features" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors py-0.5">Features</a>
            <a href="#pricing" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors py-0.5">Pricing</a>
          </div>
        </div>

        <!-- Community -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-foreground">Community</h4>
          <div class="space-y-2.5">
            <a href="https://github.com" target="_blank" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors py-0.5">GitHub</a>
            <a href="/CONTRIBUTING.md" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors py-0.5">Contributing</a>
            <a href="/LICENSE" class="block text-sm text-foreground-subtle hover:text-foreground-muted transition-colors py-0.5">License</a>
          </div>
        </div>
      </div>

      <div class="mt-10 pt-6 border-t border-border-subtle/30 text-center">
        <p class="text-xs text-foreground-subtle">&copy; {{ new Date().getFullYear() }} Vigil. Open source under MIT License.</p>
      </div>
    </div>
  </footer>
</template>
