import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/modules/cart/store'
import { fetchProduct } from '../api'
import ProductDetailView from '../views/ProductDetailView.vue'

vi.mock('../api', () => ({ fetchProduct: vi.fn() }))

const camisa = {
  id: 1,
  title: 'Camisa',
  description: 'Camisa de algodón',
  price: 10,
  thumbnail: 'mini.png',
  images: ['grande.png'],
}

function mountView(id = '1') {
  return mount(ProductDetailView, {
    props: { id },
    global: { stubs: { RouterLink: RouterLinkStub, LazyImage: true } },
  })
}

describe('ProductDetailView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    fetchProduct.mockReset()
  })

  it('muestra el estado de carga y luego el producto', async () => {
    fetchProduct.mockResolvedValue(camisa)
    const wrapper = mountView()

    expect(wrapper.find('h1').text()).toContain('Cargando')
    await flushPromises()

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe('Camisa')
    expect(wrapper.text()).toContain('Camisa de algodón')
  })

  it('usa el nombre del producto como título de la página', async () => {
    fetchProduct.mockResolvedValue(camisa)
    mountView()
    await flushPromises()

    expect(document.title).toBe('Camisa | Ecommerce Vue')
  })

  it('agrega el producto al carrito', async () => {
    fetchProduct.mockResolvedValue(camisa)
    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('.product__info button').trigger('click')

    expect(useCartStore().count).toBe(1)
    expect(wrapper.find('[role="status"]').text()).toContain('Agregado al carrito')
  })

  it('muestra un mensaje si el producto no existe', async () => {
    fetchProduct.mockRejectedValue(new Error('Product not found'))
    const wrapper = mountView('999')
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('Producto no encontrado')
  })

  it('permite reintentar después de un error', async () => {
    fetchProduct.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    fetchProduct.mockResolvedValueOnce(camisa)
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('h1').text()).toBe('No se pudo cargar el producto')

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('Camisa')
  })

  it('carga otro producto cuando cambia el id', async () => {
    fetchProduct.mockResolvedValue(camisa)
    const wrapper = mountView('1')
    await flushPromises()

    await wrapper.setProps({ id: '2' })

    expect(fetchProduct).toHaveBeenLastCalledWith('2')
  })
})
