import { reactive, readonly, watch } from 'vue'

const THEME_STORAGE_KEY = 'app_theme'

const state = reactive({
  theme: localStorage.getItem(THEME_STORAGE_KEY) || 'dark'
})

export function useTheme() {
  function applyTheme(theme) {
    state.theme = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark')
  }

  function initTheme() {
    applyTheme(state.theme)
  }

  return {
    state: readonly(state),
    applyTheme,
    toggleTheme,
    initTheme
  }
}
