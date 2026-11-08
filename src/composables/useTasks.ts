import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { Filter, Task } from '../types'

/** Ключ в localStorage по умолчанию. */
export const DEFAULT_STORAGE_KEY = 'todo-vue.tasks'

/** Что возвращает composable наружу — для компонентов. */
export interface UseTasks {
  /** Все задачи (в порядке добавления). */
  tasks: Ref<Task[]>
  /** Текущий фильтр. */
  filter: Ref<Filter>
  /** Задачи с учётом текущего фильтра. */
  filteredTasks: ComputedRef<Task[]>
  /** Сколько задач ещё не выполнено. */
  remaining: ComputedRef<number>
  /** Есть ли хотя бы одна выполненная задача. */
  hasCompleted: ComputedRef<boolean>
  /** Добавить задачу. Пустой текст игнорируется. Возвращает true, если добавили. */
  addTask: (title: string) => boolean
  /** Переключить «выполнено / не выполнено». */
  toggleTask: (id: string) => void
  /** Удалить задачу. */
  removeTask: (id: string) => void
  /** Сохранить новый текст задачи. Пустой текст удаляет задачу. Возвращает true, если задача осталась. */
  editTask: (id: string, title: string) => boolean
  /** Установить фильтр. */
  setFilter: (value: Filter) => void
  /** Удалить все выполненные задачи. */
  clearCompleted: () => void
}

/** Генерация идентификатора с запасным вариантом, если crypto.randomUUID недоступен. */
function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Проверка, что произвольное значение похоже на корректную задачу. */
function isValidTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'number'
  )
}

/**
 * Безопасная загрузка задач из localStorage.
 * При любой ошибке (нет данных, битый JSON, не тот формат) возвращает пустой список,
 * чтобы приложение не падало.
 */
function loadTasks(storageKey: string): Task[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw === null) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    // Оставляем только валидные записи и нормализуем текст.
    return parsed.filter(isValidTask).map((task) => ({
      id: task.id,
      title: task.title.trim(),
      completed: task.completed,
      createdAt: task.createdAt,
    }))
  } catch {
    return []
  }
}

/** Безопасное сохранение задач в localStorage (ошибки записи игнорируем). */
function saveTasks(storageKey: string, tasks: Task[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks))
  } catch {
    // Например, приватный режим или переполнение — молча пропускаем.
  }
}

/**
 * Вся логика работы со списком задач.
 * Не зависит от компонентов, поэтому её удобно тестировать отдельно.
 */
export function useTasks(storageKey: string = DEFAULT_STORAGE_KEY): UseTasks {
  const tasks = ref<Task[]>(loadTasks(storageKey))
  const filter = ref<Filter>('all')

  const filteredTasks = computed<Task[]>(() => {
    switch (filter.value) {
      case 'active':
        return tasks.value.filter((task) => !task.completed)
      case 'completed':
        return tasks.value.filter((task) => task.completed)
      default:
        return tasks.value
    }
  })

  const remaining = computed<number>(
    () => tasks.value.filter((task) => !task.completed).length,
  )

  const hasCompleted = computed<boolean>(() =>
    tasks.value.some((task) => task.completed),
  )

  function addTask(title: string): boolean {
    const trimmed = title.trim()
    if (trimmed === '') {
      return false
    }
    tasks.value.push({
      id: createId(),
      title: trimmed,
      completed: false,
      createdAt: Date.now(),
    })
    return true
  }

  function toggleTask(id: string): void {
    const task = tasks.value.find((item) => item.id === id)
    if (task) {
      task.completed = !task.completed
    }
  }

  function removeTask(id: string): void {
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  function editTask(id: string, title: string): boolean {
    const trimmed = title.trim()
    // Пустой текст после редактирования — считаем, что задачу удалили.
    if (trimmed === '') {
      removeTask(id)
      return false
    }
    const task = tasks.value.find((item) => item.id === id)
    if (task) {
      task.title = trimmed
    }
    return true
  }

  function setFilter(value: Filter): void {
    filter.value = value
  }

  function clearCompleted(): void {
    tasks.value = tasks.value.filter((task) => !task.completed)
  }

  // Любое изменение списка сразу сохраняем в localStorage.
  // flush: 'sync' — запись происходит синхронно, это удобно и предсказуемо в тестах.
  watch(
    tasks,
    (value) => {
      saveTasks(storageKey, value)
    },
    { deep: true, flush: 'sync' },
  )

  return {
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
  }
}
