<script setup lang="ts">
import type { Task } from '../types'
import TaskItem from './TaskItem.vue'

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  toggle: [id: string]
  remove: [id: string]
  edit: [id: string, title: string]
}>()
</script>

<template>
  <!-- TransitionGroup анимирует появление, удаление и перестановку задач. -->
  <TransitionGroup
    tag="ul"
    name="task"
    class="task-list"
  >
    <TaskItem
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      @toggle="emit('toggle', $event)"
      @remove="emit('remove', $event)"
      @edit="(id, title) => emit('edit', id, title)"
    />
  </TransitionGroup>
</template>
