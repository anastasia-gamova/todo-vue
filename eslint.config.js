import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

// Плоская конфигурация ESLint (ESLint 9) для Vue 3 + TypeScript.
export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    // В <script> внутри .vue используем парсер TypeScript.
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    // Корневой компонент App — одно слово, это допустимое исключение.
    files: ['src/App.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    rules: {
      // Строго запрещаем any по условию задания.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
)
