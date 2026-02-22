<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :class="cn(
      'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
      'disabled:cursor-not-allowed disabled:opacity-50',
      modelValue ? 'bg-accent' : 'bg-surface-overlay',
    )"
    :disabled="disabled"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      :class="cn(
        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200',
        modelValue ? 'translate-x-4' : 'translate-x-0',
      )"
    />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
