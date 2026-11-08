<script setup lang="ts">
import { ref } from 'vue'

// Сообщаем родителю, что нужно добавить задачу с таким текстом.
const emit = defineEmits<{
  add: [title: string]
}>()

const title = ref('')

function submit(): void {
  // Пустую задачу не добавляем (проверка и здесь, и в логике useTasks).
  if (title.value.trim() === '') {
    return
  }
  emit('add', title.value)
  title.value = ''
}
</script>

<template>
  <!-- form: Enter внутри поля сам отправляет форму, кнопка — тоже. -->
  <form
    class="task-input"
    @submit.prevent="submit"
  >
    <label
      class="visually-hidden"
      for="new-task"
    >Новая задача</label>
    <input
      id="new-task"
      v-model="title"
      class="task-input__field"
      type="text"
      placeholder="Что нужно сделать?"
      autocomplete="off"
    >
    <button
      class="task-input__button"
      type="submit"
    >
      Добавить
    </button>
  </form>
</template>
