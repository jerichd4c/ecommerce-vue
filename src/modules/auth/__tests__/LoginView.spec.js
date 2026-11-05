import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '../store'

const DummyPage = { template: '<div>Página de prueba</div>' }

function createTestRouter(initialPath = '/login') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'catalog', component: DummyPage },
      { path: '/login', name: 'login', component: LoginView },
      { path: '/checkout', name: 'checkout', component: DummyPage },
    ],
  })
  router.push(initialPath)
  return router
}

async function mountView(path = '/login') {
  const router = createTestRouter(path)
  await router.isReady()
  const wrapper = mount(LoginView, {
    global: {
      plugins: [router],
    },
    attachTo: document.body,
  })
  return { wrapper, router }
}

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('muestra el usuario de prueba y los campos del formulario', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.find('h1').text()).toBe('Iniciar sesión')
    expect(wrapper.text()).toContain('emilys')
    expect(wrapper.text()).toContain('emilyspass')
    expect(wrapper.find('input#username').exists()).toBe(true)
    expect(wrapper.find('input#password[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Iniciar sesión')
  })

  it('valida campos obligatorios y mueve el foco al primer campo con error', async () => {
    const { wrapper } = await mountView()
    const auth = useAuthStore()
    const loginSpy = vi.spyOn(auth, 'login')

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('El nombre de usuario es obligatorio')
    expect(wrapper.text()).toContain('La contraseña es obligatoria')
    expect(loginSpy).not.toHaveBeenCalled()
    expect(document.activeElement?.id).toBe('username')

    // Si llenamos el usuario y enviamos de nuevo, el foco debe ir a password
    await wrapper.find('input#username').setValue('emilys')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).not.toContain('El nombre de usuario es obligatorio')
    expect(wrapper.text()).toContain('La contraseña es obligatoria')
    expect(document.activeElement?.id).toBe('password')
  })

  it('login correcto redirige al catálogo por defecto', async () => {
    const { wrapper, router } = await mountView('/login')
    const auth = useAuthStore()
    const loginSpy = vi.spyOn(auth, 'login').mockResolvedValueOnce({
      id: 1,
      username: 'emilys',
      accessToken: 'test-token',
    })

    await wrapper.find('input#username').setValue('emilys')
    await wrapper.find('input#password').setValue('emilyspass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(loginSpy).toHaveBeenCalledWith({
      username: 'emilys',
      password: 'emilyspass',
    })
    expect(router.currentRoute.value.name).toBe('catalog')
  })

  it('respeta el redirect seguro de la URL', async () => {
    const { wrapper, router } = await mountView('/login?redirect=/checkout')
    const auth = useAuthStore()
    vi.spyOn(auth, 'login').mockResolvedValueOnce({
      id: 1,
      username: 'emilys',
      accessToken: 'test-token',
    })

    await wrapper.find('input#username').setValue('emilys')
    await wrapper.find('input#password').setValue('emilyspass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/checkout')
  })

  it('ignora redirect inseguro y redirige al catálogo', async () => {
    const { wrapper, router } = await mountView('/login?redirect=//evil.com')
    const auth = useAuthStore()
    vi.spyOn(auth, 'login').mockResolvedValueOnce({
      id: 1,
      username: 'emilys',
      accessToken: 'test-token',
    })

    await wrapper.find('input#username').setValue('emilys')
    await wrapper.find('input#password').setValue('emilyspass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('catalog')
  })

  it('muestra mensaje de error con role="alert" si el login falla', async () => {
    const { wrapper, router } = await mountView('/login')
    const auth = useAuthStore()
    vi.spyOn(auth, 'login').mockRejectedValueOnce(new Error('Invalid credentials'))

    await wrapper.find('input#username').setValue('emilys')
    await wrapper.find('input#password').setValue('wrongpass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const alert = wrapper.find('.login__error[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toBe('Invalid credentials')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('desactiva el botón y muestra texto de carga mientras espera la respuesta', async () => {
    const { wrapper } = await mountView('/login')
    const auth = useAuthStore()

    vi.spyOn(auth, 'login').mockImplementation(async () => {
      await nextTick()
      const btn = wrapper.find('button[type="submit"]')
      expect(btn.text()).toContain('Ingresando...')
      expect(btn.attributes('disabled')).toBeDefined()
      return { id: 1, accessToken: 'token' }
    })

    await wrapper.find('input#username').setValue('emilys')
    await wrapper.find('input#password').setValue('emilyspass')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.text()).toContain('Iniciar sesión')
    expect(submitBtn.attributes('disabled')).toBeUndefined()
  })
})
