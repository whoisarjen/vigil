<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <TransitionGroup
        enter-active-class="transition-all duration-300"
        leave-active-class="transition-all duration-200"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        leave-to-class="opacity-0 translate-x-4"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="cn(
            'flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border shadow-lg backdrop-blur-xl text-sm',
            t.type === 'success' && 'bg-success-muted border-success/20 text-success',
            t.type === 'error' && 'bg-danger-muted border-danger/20 text-danger',
            t.type === 'info' && 'bg-surface border-border text-foreground',
          )"
        >
          <span>{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts } = useToast()
</script>
