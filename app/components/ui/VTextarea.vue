<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="textareaId"
      class="block text-sm font-medium text-foreground-muted"
    >
      {{ label }}
    </label>
    <div class="relative">
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :rows="rows"
        :disabled="disabled"
        :class="cn(
          'w-full bg-surface border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle',
          'transition-colors duration-200',
          'focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'resize-none',
          error && 'border-danger/50 focus:border-danger/50 focus:ring-danger/30',
          props.class,
        )"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-foreground-subtle">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  error?: string
  hint?: string
  class?: string
}>(), {
  rows: 3,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const textareaId = useId()
const textareaRef = ref<HTMLTextAreaElement>()

defineExpose({ focus: () => textareaRef.value?.focus() })
</script>
