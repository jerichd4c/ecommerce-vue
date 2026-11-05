import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import router from '../index'
import { useAuthStore } from '@/modules/auth/store'

describe('títulos de página', () => {
  beforeEach(async () => {
    localStorage.clear()
    setActivePinia(createPinia())
    // El router es único y recuerda la página anterior: si ya está en la ruta pedida,
    // push() no navega y el guard no corre. Se parte siempre de una página neutra.
    await router.replace('/__inicio-de-prueba__')
  })

  it.each([
    ['/', 'Catálogo | Ecommerce Vue'],
    ['/cart', 'Carrito | Ecommerce Vue'],
    ['/login', 'Iniciar sesión | Ecommerce Vue'],
    ['/product/1', 'Detalle del producto | Ecommerce Vue'],
    ['/no-existe', 'Página no encontrada | Ecommerce Vue'],
  ])('%s se titula "%s"', async (path, title) => {
    await router.push(path)

    expect(document.title).toBe(title)
  })

  it('usa el título de la página de destino cuando el guard redirige', async () => {
    await router.push('/checkout')

    expect(router.currentRoute.value.name).toBe('login')
    expect(document.title).toBe('Iniciar sesión | Ecommerce Vue')
  })

  it('titula el checkout cuando hay sesión', async () => {
    useAuthStore().token = 'token-de-prueba'

    await router.push('/checkout')

    expect(document.title).toBe('Finalizar compra | Ecommerce Vue')
  })
})
