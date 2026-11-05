import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { http } from '@/shared/http'
import { useAuthStore } from '../store'

vi.mock('@/shared/http', () => ({
  http: vi.fn(),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('inicia sin sesión si no hay datos guardados', () => {
    const auth = useAuthStore()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })

  it('inicia sesión exitosamente y guarda el token y el usuario', async () => {
    const auth = useAuthStore()
    const mockResponse = {
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
      accessToken: 'jwt-access-token-123',
    }

    vi.mocked(http).mockResolvedValueOnce(mockResponse)

    const credentials = { username: 'emilys', password: 'emilyspass' }
    await auth.login(credentials)

    expect(http).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    expect(auth.token).toBe('jwt-access-token-123')
    expect(auth.user).toEqual({
      id: 1,
      username: 'emilys',
      email: 'emily@example.com',
      firstName: 'Emily',
    })
    expect(auth.isAuthenticated).toBe(true)

    const saved = JSON.parse(localStorage.getItem('auth'))
    expect(saved.token).toBe('jwt-access-token-123')
    expect(saved.user.username).toBe('emilys')
  })

  it('acepta campo token si la respuesta no trae accessToken', async () => {
    const auth = useAuthStore()
    vi.mocked(http).mockResolvedValueOnce({
      id: 2,
      username: 'otro',
      token: 'jwt-legacy-token',
    })

    await auth.login({ username: 'otro', password: '123' })

    expect(auth.token).toBe('jwt-legacy-token')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('propaga el error si la petición de login falla', async () => {
    const auth = useAuthStore()
    vi.mocked(http).mockRejectedValueOnce(new Error('Credenciales inválidas'))

    await expect(auth.login({ username: 'bad', password: 'bad' })).rejects.toThrow(
      'Credenciales inválidas',
    )

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth')).toBeNull()
  })

  it('cierra sesión y limpia el estado y localStorage', async () => {
    const auth = useAuthStore()
    vi.mocked(http).mockResolvedValueOnce({
      id: 1,
      username: 'emilys',
      accessToken: 'token-valido',
    })

    await auth.login({ username: 'emilys', password: 'password' })
    expect(auth.isAuthenticated).toBe(true)

    auth.logout()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth')).toBeNull()
  })

  it('recupera la sesión al recargar la página', async () => {
    const auth = useAuthStore()
    vi.mocked(http).mockResolvedValueOnce({
      id: 1,
      username: 'emilys',
      accessToken: 'token-sesion-recargable',
    })

    await auth.login({ username: 'emilys', password: 'password' })
    await nextTick()

    // Simular recarga creando una nueva instancia de Pinia
    setActivePinia(createPinia())
    const recargado = useAuthStore()

    expect(recargado.token).toBe('token-sesion-recargable')
    expect(recargado.user.username).toBe('emilys')
    expect(recargado.isAuthenticated).toBe(true)
  })

  it('inicia vacío si el contenido de localStorage está dañado', () => {
    localStorage.setItem('auth', '{no es un json valido')

    const auth = useAuthStore()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })
})
