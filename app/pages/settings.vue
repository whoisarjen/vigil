<template>
  <div>
    <DashboardHeader>
      <template #title>Settings</template>
    </DashboardHeader>

    <div class="p-6 lg:p-8 max-w-2xl space-y-8">
      <!-- Profile -->
      <div class="glass-card p-6 space-y-4" style="transform: none">
        <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Profile</h3>
        <div class="flex items-center gap-4">
          <img
            v-if="session?.user?.image"
            :src="session.user.image"
            :alt="session.user.name || 'User'"
            class="w-14 h-14 rounded-full border border-border-subtle"
          />
          <div v-else class="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-xl font-bold text-accent-light">
            {{ session?.user?.name?.charAt(0) || '?' }}
          </div>
          <div>
            <p class="text-lg font-semibold text-foreground">{{ session?.user?.name || 'User' }}</p>
            <p class="text-sm text-foreground-muted">{{ session?.user?.email }}</p>
          </div>
        </div>
      </div>

      <!-- Plan & Usage -->
      <div class="glass-card p-6 space-y-4" style="transform: none">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-foreground-muted uppercase tracking-wider">Plan & Usage</h3>
          <VBadge variant="accent">{{ currentPlan.name }}</VBadge>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-foreground-muted">Monitors</span>
            <span class="text-sm font-medium text-foreground">{{ monitorCount }} / {{ currentPlan.maxMonitors }}</span>
          </div>
          <div class="h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-accent transition-all duration-500"
              :style="{ width: `${Math.min((monitorCount / currentPlan.maxMonitors) * 100, 100)}%` }"
            />
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-foreground-muted">History retention</span>
            <span class="text-sm font-medium text-foreground">{{ currentPlan.historyDays }} days</span>
          </div>
        </div>
        <div class="pt-2">
          <VButton variant="secondary" size="sm" disabled>
            <Sparkles class="w-3.5 h-3.5" />
            Upgrade to Pro — Coming Soon
          </VButton>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="rounded-[var(--radius-lg)] border border-danger/20 bg-danger-muted/30 p-6 space-y-4">
        <h3 class="text-sm font-semibold text-danger uppercase tracking-wider">Danger Zone</h3>
        <p class="text-sm text-foreground-muted">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <VButton variant="danger" size="sm" @click="showDeleteAccount = true">
          <Trash2 class="w-3.5 h-3.5" />
          Delete Account
        </VButton>
      </div>
    </div>

    <!-- Delete Account Dialog -->
    <VDialog v-model="showDeleteAccount" title="Delete Account">
      <p class="text-sm text-foreground-muted">
        Are you sure you want to delete your account? This will permanently remove all your monitors and check history. This cannot be undone.
      </p>
      <template #footer>
        <VButton variant="ghost" @click="showDeleteAccount = false">Cancel</VButton>
        <VButton variant="danger" :loading="deleting" @click="handleDeleteAccount">
          Delete Account
        </VButton>
      </template>
    </VDialog>

  </div>
</template>

<script setup lang="ts">
import { Sparkles, Trash2 } from 'lucide-vue-next'
import { PLANS } from '~~/shared/types'
import type { MonitorWithLatest } from '~~/shared/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { session, clear } = useUserSession()
const { error } = useToast()

const showDeleteAccount = ref(false)
const deleting = ref(false)

const currentPlan = computed(() => PLANS[session.value?.user?.plan as keyof typeof PLANS || 'free'])

const { data: monitors } = await useFetch('/api/monitors')
const monitorCount = computed(() => (monitors.value as MonitorWithLatest[] | null)?.length || 0)

async function handleDeleteAccount() {
  deleting.value = true
  try {
    await $fetch('/api/user', { method: 'DELETE' })
    await clear()
    navigateTo('/')
  } catch (err: any) {
    error(err.data?.statusMessage || 'Failed to delete account')
    deleting.value = false
  }
}
</script>
