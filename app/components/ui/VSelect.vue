<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="selectId"
      class="block text-sm font-medium text-foreground-muted"
    >
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :class="cn(
        'w-full bg-surface border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-foreground',
        'transition-colors duration-200 appearance-none cursor-pointer',
        'focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'pr-10',
        props.class,
      )"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <slot />
    </select>
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string | number
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  class?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectId = useId()
</script>
