<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { Task } from '../types'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  toggle: [id: string]
  remove: [id: string]
  edit: [id: string, title: string]
}>()

// Режим редактирования и черновик текста.
const editing = ref(false)
const draft = ref('')
const editField = ref<HTMLInputElement | null>(null)

async function startEditing(): Promise<void> {
  editing.value = true
  draft.value = props.task.title
  // Ждём перерисовку, затем ставим курсор в поле и выделяем текст.
  await nextTick()
  editField.value?.focus()
  editField.value?.select()
}

function saveEditing(): void {
  // Защита от повторного вызова (например, blur после Enter/Esc).
  if (!editing.value) {
    return
  }
  editing.value = false
  emit('edit', props.task.id, draft.value)
}

function cancelEditing(): void {
  // Esc — отменяем без сохранения.
  editing.value = false
}
</script>

<template>
  <li
    class="task-item"
    :class="{ 'task-item--completed': task.completed }"
  >
    <template v-if="!editing">
      <input
        :id="`task-${task.id}`"
        class="task-item__checkbox"
        type="checkbox"
        :checked="task.completed"
        :aria-label="`Отметить выполненной: ${task.title}`"
        @change="emit('toggle', task.id)"
      >
      <span
        class="task-item__title"
        @dblclick="startEditing"
      >
        {{ task.title }}
      </span>
      <button
        class="task-item__button"
        type="button"
        :aria-label="`Редактировать задачу: ${task.title}`"
        @click="startEditing"
      >
        ✎
      </button>
      <button
        class="task-item__button task-item__button--delete"
        type="button"
        :aria-label="`Удалить задачу: ${task.title}`"
        @click="emit('remove', task.id)"
      >
        ×
      </button>
    </template>

    <input
      v-else
      ref="editField"
      v-model="draft"
      class="task-item__edit"
      type="text"
      :aria-label="`Редактирование задачи: ${task.title}`"
      @keyup.enter="saveEditing"
      @keyup.esc="cancelEditing"
      @blur="saveEditing"
    >
  </li>
</template>
