import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetchProduct } from '../api'
import { useProductStore } from '../store'

vi.mock('../api', () => ({ fetchProduct: vi.fn() }))

const camisa = { id: 1, title: 'Camisa', price: 10 }

describe('useProductStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    fetchProduct.mockReset()
  })

  it('carga el producto', async () => {
    fetchProduct.mockResolvedValue(camisa)
    const store = useProductStore()

    const carga = store.load('1')
    expect(store.status).toBe('loading')
    await carga

    expect(store.product).toEqual(camisa)
    expect(store.status).toBe('idle')
  })

  it('marca como no encontrado si la API responde que no existe', async () => {
    fetchProduct.mockRejectedValue(new Error("Product with id '999' not found"))
    const store = useProductStore()

    await store.load('999')

    expect(store.status).toBe('not-found')
  })

  it('marca error si falla la conexión', async () => {
    fetchProduct.mockRejectedValue(new TypeError('Failed to fetch'))
    const store = useProductStore()

    await store.load('1')

    expect(store.status).toBe('error')
  })

  it('ignora la respuesta de un producto anterior', async () => {
    let resolverPrimero
    fetchProduct.mockReturnValueOnce(new Promise((resolve) => (resolverPrimero = resolve)))
    fetchProduct.mockResolvedValueOnce({ id: 2, title: 'Gorra', price: 5 })
    const store = useProductStore()

    const primera = store.load('1')
    await store.load('2')
    resolverPrimero(camisa)
    await primera

    expect(store.product.id).toBe(2)
  })
})
