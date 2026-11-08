<script setup lang="ts">
import type { Filter } from '../types'

defineProps<{
  modelValue: Filter
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Filter]
}>()

const filters: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
]
</script>

<template>
  <div class="filters-bar">
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
  </div>
</template>
