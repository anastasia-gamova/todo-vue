<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  remaining: number
  hasCompleted: boolean
}>()

const emit = defineEmits<{
  clearCompleted: []
}>()

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
  <div class="footer">
    <span
      class="counter"
      aria-live="polite"
    >{{ counterText }}</span>

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
