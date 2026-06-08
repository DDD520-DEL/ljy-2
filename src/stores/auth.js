import { reactive, readonly } from 'vue'

const state = reactive({
  user: null,
  token: localStorage.getItem('auth_token') || null
})

export function useAuth() {
  function setUser(user) {
    state.user = user
  }

  function setToken(token) {
    state.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  function logout() {
    state.user = null
    state.token = null
    localStorage.removeItem('auth_token')
  }

  function isLoggedIn() {
    return !!state.token
  }

  return {
    state: readonly(state),
    setUser,
    setToken,
    logout,
    isLoggedIn
  }
}
