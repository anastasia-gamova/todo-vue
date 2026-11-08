import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Конфигурация Vite + встроенная конфигурация Vitest (блок test).
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: false,
    // Подключаем in-memory localStorage до запуска тестов.
    setupFiles: ['./tests/setup.ts'],
  },
})
