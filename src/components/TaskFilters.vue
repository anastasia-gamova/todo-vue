<script setup lang="ts">
import { computed } from 'vue'
import type { Filter } from '../types'

const props = defineProps<{
  modelValue: Filter
  remaining: number
  hasCompleted: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Filter]
  clearCompleted: []
}>()

const filters: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
]

// Правильное склонение слова «задача» по числу.
function pluralTasks(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) {
    return 'задача'
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return 'задачи'
  }
  return 'задач'
}

const counterText = computed(
  () => `Осталось: ${props.remaining} ${pluralTasks(props.remaining)}`,
)
</script>

<template>
  <div class="toolbar">
    <span
      class="counter"
      aria-live="polite"
    >{{ counterText }}</span>

    <div
      class="filters"
      role="group"
      aria-label="Фильтр задач"
    >
      <button
        v-for="item in filters"
        :key="item.value"
        class="filters__button"
        type="button"
        :aria-pressed="modelValue === item.value"
        @click="emit('update:modelValue', item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <button
      class="clear-completed"
      type="button"
      :disabled="!hasCompleted"
      @click="emit('clearCompleted')"
    >
      Удалить выполненные
    </button>
  </div>
</template>
