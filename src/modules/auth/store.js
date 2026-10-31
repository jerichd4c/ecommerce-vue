import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)
  const isAuthenticated = computed(() => !!token.value)

  async function login(_credentials) {
    // TODO (Dev C): POST /auth/login
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, login, logout }
})
