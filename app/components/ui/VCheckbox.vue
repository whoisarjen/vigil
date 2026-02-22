<template>
  <label
    :class="cn(
      'flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-border-subtle hover:border-border cursor-pointer transition-colors',
      modelValue && 'border-accent/30 bg-accent/5',
      disabled && 'opacity-50 cursor-not-allowed',
      props.class,
    )"
  >
    <input
      :id="checkboxId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent/30 cursor-pointer accent-[var(--color-accent)]"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <div>
      <span v-if="label" class="text-sm font-medium text-foreground">{{ label }}</span>
      <p v-if="description" class="text-xs text-foreground-subtle">{{ description }}</p>
    </div>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean
  label?: string
  description?: string
  disabled?: boolean
  class?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const checkboxId = useId()
</script>
