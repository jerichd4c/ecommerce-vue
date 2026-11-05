import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { authGuard } from '../guards'
import { useAuthStore } from '../store'

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('redirige a login si la ruta requiere sesión y no hay usuario', () => {
    const to = { meta: { requiresAuth: true }, fullPath: '/checkout' }

    expect(authGuard(to)).toEqual({ name: 'login', query: { redirect: '/checkout' } })
  })

  it('deja pasar a una ruta protegida si hay sesión', () => {
    useAuthStore().token = 'token-de-prueba'
    const to = { meta: { requiresAuth: true }, fullPath: '/checkout' }

    expect(authGuard(to)).toBeUndefined()
  })

  it('saca del login al usuario que ya inició sesión', () => {
    useAuthStore().token = 'token-de-prueba'
    const to = { meta: { guestOnly: true }, fullPath: '/login' }

    expect(authGuard(to)).toEqual({ name: 'catalog' })
  })

  it('deja pasar a rutas públicas', () => {
    const to = { meta: {}, fullPath: '/' }

    expect(authGuard(to)).toBeUndefined()
  })
})
