<template>
  <aside
    :class="cn(
      'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border-subtle flex flex-col',
      'transition-transform duration-200 lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
    )"
  >
    <!-- Logo -->
    <div class="h-16 px-5 flex items-center border-b border-border-subtle/50">
      <Logo />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="cn(
          'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150',
          isActive(item.to)
            ? 'bg-accent/10 text-accent-light border-l-2 border-accent'
            : 'text-foreground-muted hover:text-foreground hover:bg-surface-raised',
        )"
        @click="sidebarOpen = false"
      >
        <component :is="item.icon" class="w-4 h-4" />
        {{ item.label }}
      </NuxtLink>
    </nav>

    <!-- User section -->
    <div class="p-3 border-t border-border-subtle/50">
      <div class="flex items-center gap-3 px-3 py-2">
        <img
          v-if="session?.user?.image"
          :src="session.user.image"
          :alt="session.user.name || 'User'"
          class="w-8 h-8 rounded-full border border-border-subtle"
        />
        <div v-else class="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light">
          {{ session?.user?.name?.charAt(0) || '?' }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-foreground truncate">{{ session?.user?.name || 'User' }}</p>
          <VBadge variant="accent" size="sm">{{ session?.user?.plan || 'free' }}</VBadge>
        </div>
      </div>
      <button
        class="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-foreground-subtle hover:text-danger hover:bg-danger-muted rounded-[var(--radius-md)] transition-colors"
        @click="handleSignOut"
      >
        <LogOut class="w-4 h-4" />
        Sign Out
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { LayoutDashboard, Activity, Settings, LogOut } from 'lucide-vue-next'

const { session, clear } = useUserSession()
const route = useRoute()
const sidebarOpen = inject<Ref<boolean>>('sidebarOpen', ref(false))

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/monitors', label: 'Monitors', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function isActive(to: string) {
  if (to === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(to)
}

async function handleSignOut() {
  await clear()
  navigateTo('/')
}
</script>
