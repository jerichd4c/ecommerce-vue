import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../App.vue'
import { useAuthStore } from '@/modules/auth/store'
import { useCartStore } from '@/modules/cart/store'

const Page = { template: '<p>Página</p>' }

async function mountApp(path) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'catalog', component: Page },
      { path: '/cart', component: Page },
      { path: '/login', component: Page },
      { path: '/checkout', component: Page },
    ],
  })
  await router.push(path)
  const wrapper = mount(App, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('actualiza el contador del header cuando cambia el carrito', async () => {
    const cart = useCartStore()
    const { wrapper } = await mountApp('/')
    expect(wrapper.find('.app-header__count').text()).toBe('0')

    cart.addItem({ id: 1, title: 'Camisa', price: 10 })
    cart.setQty(1, 2)
    await flushPromises()

    expect(wrapper.find('.app-header__count').text()).toBe('2')
  })

  it('cierra la sesión y lleva al catálogo', async () => {
    const auth = useAuthStore()
    auth.token = 'token-de-prueba'
    const logout = vi.spyOn(auth, 'logout')
    const { wrapper, router } = await mountApp('/checkout')

    await wrapper.find('.app-header button').trigger('click')
    await flushPromises()

    expect(logout).toHaveBeenCalledOnce()
    expect(auth.isAuthenticated).toBe(false)
    expect(router.currentRoute.value.name).toBe('catalog')
    expect(wrapper.find('.app-header button').exists()).toBe(false)
  })
})
