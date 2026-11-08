<script setup lang="ts">
import { computed } from 'vue'
import { useTasks } from './composables/useTasks'
import { useTheme } from './composables/useTheme'
import TaskInput from './components/TaskInput.vue'
import TaskFilters from './components/TaskFilters.vue'
import TaskList from './components/TaskList.vue'
import TaskFooter from './components/TaskFooter.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const { theme, toggle: toggleTheme } = useTheme()

const {
  tasks,
  filter,
  filteredTasks,
  remaining,
  hasCompleted,
  addTask,
  toggleTask,
  removeTask,
  editTask,
  setFilter,
  clearCompleted,
} = useTasks()

// Совсем нет задач.
const isEmpty = computed(() => tasks.value.length === 0)

// Задачи есть, но под текущий фильтр ничего не попало.
const nothingInFilter = computed(
  () => !isEmpty.value && filteredTasks.value.length === 0,
)

const emptyFilterMessage = computed(() => {
  if (filter.value === 'active') {
    return 'Нет активных задач — всё сделано 🎉'
  }
  if (filter.value === 'completed') {
    return 'Пока нет выполненных задач'
  }
  return 'Нет задач'
})
</script>

<template>
  <div class="app">
    <main class="card">
      <ThemeToggle
        :theme="theme"
        @toggle="toggleTheme"
      />
      <h1 class="card__title">
        Список задач
      </h1>

      <TaskInput @add="addTask" />

      <section
        v-if="isEmpty"
        class="empty"
      >
        <div
          class="empty__emoji"
          aria-hidden="true"
        >
          📝
        </div>
        <p>Пока нет задач. Добавьте первую!</p>
      </section>

      <template v-else>
        <!-- Фильтры — сверху. -->
        <TaskFilters
          :model-value="filter"
          @update:model-value="setFilter"
        />

        <p
          v-if="nothingInFilter"
          class="empty empty--small"
        >
          {{ emptyFilterMessage }}
        </p>
        <TaskList
          v-else
          :tasks="filteredTasks"
          @toggle="toggleTask"
          @remove="removeTask"
          @edit="editTask"
        />

        <!-- Футер под списком: счётчик слева, кнопка справа. -->
        <TaskFooter
          :remaining="remaining"
          :has-completed="hasCompleted"
          @clear-completed="clearCompleted"
        />
      </template>
    </main>
  </div>
</template>
