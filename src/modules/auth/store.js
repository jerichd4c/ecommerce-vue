import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { http } from '@/shared/http'

const STORAGE_KEY = 'auth'

function loadAuth() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && typeof saved === 'object') {
      return {
        token: saved.token || null,
        user: saved.user || null,
      }
    }
  } catch {
    return { token: null, user: null }
  }
  return { token: null, user: null }
}

export const useAuthStore = defineStore('auth', () => {
  const initial = loadAuth()
  const token = ref(initial.token)
  const user = ref(initial.user)
  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    const data = await http('/auth/login', {
      method: 'POST',
      body: credentials,
    })

    const authToken = data?.accessToken || data?.token || null
    const userData = { ...data }
    delete userData.accessToken
    delete userData.refreshToken

    token.value = authToken
    user.value = userData

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: authToken, user: userData }))
    return data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  watch(
    [token, user],
    ([newToken, newUser]) => {
      if (newToken) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user: newUser }))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    },
    { deep: true },
  )

  return { token, user, isAuthenticated, login, logout }
})
