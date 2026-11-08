import { ref, type Ref } from 'vue'

export type Theme = 'light' | 'dark'

/** Ключ в localStorage для сохранённой темы. */
export const THEME_STORAGE_KEY = 'todo-vue.theme'

export interface UseTheme {
  /** Текущая тема. */
  theme: Ref<Theme>
  /** Переключить светлую/тёмную тему и запомнить выбор. */
  toggle: () => void
}

/** Безопасно читаем сохранённую тему (или null, если её нет/ошибка). */
function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/** Системная тема по настройке ОС. */
function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** Применяем тему к документу — CSS читает её через [data-theme]. */
function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * Управление темой:
 * — старт по сохранённому выбору, иначе по системной настройке;
 * — пока пользователь не выбрал вручную, следуем за системной темой.
 */
export function useTheme(): UseTheme {
  const stored = readStoredTheme()
  // Запомнил ли пользователь выбор явно.
  let explicit = stored !== null

  const theme = ref<Theme>(stored ?? systemTheme())
  applyTheme(theme.value)

  // Следим за системной темой, пока выбор не сделан вручную.
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', (event) => {
    if (!explicit) {
      theme.value = event.matches ? 'dark' : 'light'
      applyTheme(theme.value)
    }
  })

  function toggle(): void {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    explicit = true
    applyTheme(theme.value)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.value)
    } catch {
      // Сохранение необязательно — тема всё равно применится.
    }
  }

  return { theme, toggle }
}
