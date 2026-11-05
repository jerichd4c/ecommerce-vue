import { describe, it, expect, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CartView from '../views/CartView.vue'
import { useCartStore } from '../store'

const camisa = { id: 1, title: 'Camisa', price: 10, thumbnail: 'camisa.png' }

function mountView() {
  return mount(CartView, {
    global: { stubs: { RouterLink: RouterLinkStub, LazyImage: true } },
  })
}

describe('CartView', () => {
  let cart

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    cart = useCartStore()
  })

  it('muestra el mensaje de carrito vacío', () => {
    expect(mountView().text()).toContain('Tu carrito está vacío')
  })

  it('muestra los productos y el total', () => {
    cart.addItem(camisa)
    cart.setQty(camisa.id, 2)
    const wrapper = mountView()

    expect(wrapper.text()).toContain('Camisa')
    expect(wrapper.find('.cart-summary__total').text()).toContain('Total (2)')
  })

  it('cambia la cantidad y actualiza el total con los botones', async () => {
    cart.addItem(camisa)
    const wrapper = mountView()

    await wrapper.find('[aria-label="Agregar una unidad de Camisa"]').trigger('click')
    expect(cart.items[0].qty).toBe(2)
    expect(wrapper.find('.cart-summary__total').text()).toContain('Total (2)')

    await wrapper.find('[aria-label="Quitar una unidad de Camisa"]').trigger('click')
    expect(cart.items[0].qty).toBe(1)
  })

  it('no permite bajar la cantidad de 1', () => {
    cart.addItem(camisa)
    const boton = mountView().find('[aria-label="Quitar una unidad de Camisa"]')

    expect(boton.attributes('disabled')).toBeDefined()
  })

  it('quita el producto y vuelve al estado vacío', async () => {
    cart.addItem(camisa)
    const wrapper = mountView()

    await wrapper.find('[aria-label="Quitar Camisa del carrito"]').trigger('click')

    expect(cart.items).toEqual([])
    expect(wrapper.text()).toContain('Tu carrito está vacío')
  })
})
