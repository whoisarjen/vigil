<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-foreground-muted"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="cn(
          'w-full bg-surface border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle',
          'transition-colors duration-200',
          'focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger/50 focus:border-danger/50 focus:ring-danger/30',
          props.class,
        )"
        @input="handleInput($event)"
      />
    </div>
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-foreground-subtle">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  error?: string
  hint?: string
  class?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputId = useId()
const inputRef = ref<HTMLInputElement>()

function handleInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  // If the input type is number and the modelValue is a number, coerce to number
  if (props.type === 'number' && typeof props.modelValue === 'number') {
    const num = Number(raw)
    emit('update:modelValue', raw === '' ? raw : isNaN(num) ? raw : num)
  } else {
    emit('update:modelValue', raw)
  }
}

defineExpose({ focus: () => inputRef.value?.focus() })
</script>
