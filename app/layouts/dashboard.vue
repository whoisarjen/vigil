<template>
  <div class="min-h-screen bg-background flex">
    <!-- Sidebar -->
    <DashboardSidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen min-w-0 lg:pl-64">
      <!-- Page Content (pages render their own DashboardHeader) -->
      <main class="flex-1">
        <slot />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="sidebarOpen"
          class="fixed inset-0 bg-black/60 z-40 lg:hidden"
          @click="sidebarOpen = false"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
const sidebarOpen = useState('sidebarOpen', () => false)

provide('sidebarOpen', sidebarOpen)
</script>
