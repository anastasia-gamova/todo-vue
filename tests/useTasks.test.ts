import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_STORAGE_KEY, useTasks } from '../src/composables/useTasks'
import type { Task } from '../src/types'

// Отдельный ключ для тестов, чтобы не пересекаться с ключом по умолчанию.
const KEY = 'test.tasks'

function readStorage(key: string = KEY): unknown {
  const raw = localStorage.getItem(key)
  return raw === null ? null : JSON.parse(raw)
}

beforeEach(() => {
  localStorage.clear()
})

describe('useTasks — добавление', () => {
  it('добавляет задачу с обрезкой пробелов', () => {
    const { tasks, addTask } = useTasks(KEY)
    const added = addTask('  Купить хлеб  ')

    expect(added).toBe(true)
    expect(tasks.value).toHaveLength(1)
    expect(tasks.value[0].title).toBe('Купить хлеб')
    expect(tasks.value[0].completed).toBe(false)
  })

  it('не добавляет пустую задачу или задачу из пробелов', () => {
    const { tasks, addTask } = useTasks(KEY)

    expect(addTask('')).toBe(false)
    expect(addTask('   ')).toBe(false)
    expect(tasks.value).toHaveLength(0)
  })
})

describe('useTasks — отметка выполнения', () => {
  it('переключает статус задачи', () => {
    const { tasks, addTask, toggleTask } = useTasks(KEY)
    addTask('Задача')
    const id = tasks.value[0].id

    toggleTask(id)
    expect(tasks.value[0].completed).toBe(true)

    toggleTask(id)
    expect(tasks.value[0].completed).toBe(false)
  })

  it('игнорирует несуществующий id', () => {
    const { tasks, addTask, toggleTask } = useTasks(KEY)
    addTask('Задача')
    toggleTask('нет-такого')
    expect(tasks.value[0].completed).toBe(false)
  })
})

describe('useTasks — удаление', () => {
  it('удаляет задачу по id', () => {
    const { tasks, addTask, removeTask } = useTasks(KEY)
    addTask('Первая')
    addTask('Вторая')
    const id = tasks.value[0].id

    removeTask(id)
    expect(tasks.value).toHaveLength(1)
    expect(tasks.value[0].title).toBe('Вторая')
  })
})

describe('useTasks — редактирование', () => {
  it('сохраняет новый текст с обрезкой пробелов', () => {
    const { tasks, addTask, editTask } = useTasks(KEY)
    addTask('Старый текст')
    const id = tasks.value[0].id

    const kept = editTask(id, '  Новый текст  ')
    expect(kept).toBe(true)
    expect(tasks.value[0].title).toBe('Новый текст')
  })

  it('удаляет задачу, если новый текст пустой', () => {
    const { tasks, addTask, editTask } = useTasks(KEY)
    addTask('Текст')
    const id = tasks.value[0].id

    const kept = editTask(id, '   ')
    expect(kept).toBe(false)
    expect(tasks.value).toHaveLength(0)
  })
})

describe('useTasks — фильтры и счётчики', () => {
  it('фильтрует активные и выполненные', () => {
    const { tasks, addTask, toggleTask, filter, filteredTasks, setFilter } =
      useTasks(KEY)
    addTask('A')
    addTask('B')
    addTask('C')
    toggleTask(tasks.value[1].id) // B выполнена

    expect(filter.value).toBe('all')
    expect(filteredTasks.value).toHaveLength(3)

    setFilter('active')
    expect(filteredTasks.value.map((t) => t.title)).toEqual(['A', 'C'])

    setFilter('completed')
    expect(filteredTasks.value.map((t) => t.title)).toEqual(['B'])
  })

  it('считает оставшиеся активные задачи и наличие выполненных', () => {
    const { tasks, addTask, toggleTask, remaining, hasCompleted } =
      useTasks(KEY)
    addTask('A')
    addTask('B')

    expect(remaining.value).toBe(2)
    expect(hasCompleted.value).toBe(false)

    toggleTask(tasks.value[0].id)
    expect(remaining.value).toBe(1)
    expect(hasCompleted.value).toBe(true)
  })

  it('удаляет все выполненные задачи', () => {
    const { tasks, addTask, toggleTask, clearCompleted } = useTasks(KEY)
    addTask('A')
    addTask('B')
    addTask('C')
    toggleTask(tasks.value[0].id)
    toggleTask(tasks.value[2].id)

    clearCompleted()
    expect(tasks.value.map((t) => t.title)).toEqual(['B'])
  })
})

describe('useTasks — сохранение и загрузка', () => {
  it('сохраняет задачи в localStorage при изменениях', () => {
    const { addTask } = useTasks(KEY)
    addTask('Сохрани меня')

    const saved = readStorage() as Task[]
    expect(Array.isArray(saved)).toBe(true)
    expect(saved).toHaveLength(1)
    expect(saved[0].title).toBe('Сохрани меня')
  })

  it('загружает ранее сохранённые задачи', () => {
    const existing: Task[] = [
      { id: '1', title: 'Была раньше', completed: true, createdAt: 1 },
    ]
    localStorage.setItem(KEY, JSON.stringify(existing))

    const { tasks } = useTasks(KEY)
    expect(tasks.value).toHaveLength(1)
    expect(tasks.value[0].title).toBe('Была раньше')
    expect(tasks.value[0].completed).toBe(true)
  })

  it('использует ключ по умолчанию, если он не задан', () => {
    const { addTask } = useTasks()
    addTask('Задача')
    expect(localStorage.getItem(DEFAULT_STORAGE_KEY)).not.toBeNull()
  })
})

describe('useTasks — устойчивость к битым данным', () => {
  it('не падает на некорректном JSON', () => {
    localStorage.setItem(KEY, '{не JSON')
    const { tasks } = useTasks(KEY)
    expect(tasks.value).toEqual([])
  })

  it('игнорирует данные не-массив', () => {
    localStorage.setItem(KEY, JSON.stringify({ foo: 'bar' }))
    const { tasks } = useTasks(KEY)
    expect(tasks.value).toEqual([])
  })

  it('отбрасывает записи неправильной формы, оставляя корректные', () => {
    const mixed = [
      { id: 'ok', title: 'Правильная', completed: false, createdAt: 1 },
      { id: 'плохая', title: 123, completed: 'нет' },
      null,
      'строка',
    ]
    localStorage.setItem(KEY, JSON.stringify(mixed))

    const { tasks } = useTasks(KEY)
    expect(tasks.value).toHaveLength(1)
    expect(tasks.value[0].title).toBe('Правильная')
  })
})
