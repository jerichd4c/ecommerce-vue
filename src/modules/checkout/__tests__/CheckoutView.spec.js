import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CheckoutView from '../views/CheckoutView.vue'
import { useAuthStore } from '@/modules/auth/store'
import { useCartStore } from '@/modules/cart/store'

const mockProduct = {
  id: 101,
  title: 'Laptop Pro',
  price: 999.99,
  thumbnail: 'laptop.jpg',
}

function mountCheckout() {
  return mount(CheckoutView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
    attachTo: document.body,
  })
}

describe('CheckoutView', () => {
  let cart
  let auth

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    cart = useCartStore()
    auth = useAuthStore()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('muestra mensaje de carrito vacío si no hay productos', () => {
    const wrapper = mountCheckout()

    expect(wrapper.text()).toContain('Tu carrito está vacío')
    expect(wrapper.find('form').exists()).toBe(false)
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props('to')).toEqual({ name: 'catalog' })
  })

  it('muestra el resumen del pedido y el formulario cuando el carrito tiene productos', () => {
    cart.addItem(mockProduct)
    cart.setQty(mockProduct.id, 2)

    const wrapper = mountCheckout()

    expect(wrapper.find('h1').text()).toBe('Finalizar compra')
    expect(wrapper.text()).toContain('Laptop Pro')
    expect(wrapper.text()).toContain('Cantidad: 2')
    expect(wrapper.text()).toContain('$1,999.98')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('rellena nombre y correo con los datos de auth.user', () => {
    auth.user = {
      firstName: 'Emily',
      lastName: 'Johnson',
      email: 'emily@example.com',
    }
    cart.addItem(mockProduct)

    const wrapper = mountCheckout()

    const nameInput = wrapper.find('input#name').element
    const emailInput = wrapper.find('input#email').element

    expect(nameInput.value).toBe('Emily Johnson')
    expect(emailInput.value).toBe('emily@example.com')
  })

  it('muestra errores de validación y mueve el foco al primer campo con error al enviar vacío', async () => {
    cart.addItem(mockProduct)
    const wrapper = mountCheckout()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('El nombre completo es obligatorio')
    expect(wrapper.text()).toContain('El correo electrónico es obligatorio')
    expect(wrapper.text()).toContain('La dirección es obligatoria')
    expect(wrapper.text()).toContain('El número de tarjeta es obligatorio')

    expect(document.activeElement?.id).toBe('name')
  })

  it('simula el procesamiento, muestra confirmación y vacía el carrito', async () => {
    vi.useFakeTimers()
    cart.addItem(mockProduct)
    const clearSpy = vi.spyOn(cart, 'clear')

    const wrapper = mountCheckout()

    await wrapper.find('input#name').setValue('Jesús Quintero')
    await wrapper.find('input#email').setValue('jesus@example.com')
    await wrapper.find('input#address').setValue('Calle 72 con Av. 10')
    await wrapper.find('input#city').setValue('Maracaibo')
    await wrapper.find('input#cardNumber').setValue('4532 1234 5678 9012')
    await wrapper.find('input#cardExp').setValue('12/28')
    await wrapper.find('input#cardCvv').setValue('789')

    await wrapper.find('form').trigger('submit')

    // Botón en estado de carga
    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.text()).toContain('Procesando...')
    expect(submitBtn.attributes('disabled')).toBeDefined()

    // Avanzar el segundo de simulación
    await vi.advanceTimersByTimeAsync(1000)
    await flushPromises()

    // Pantalla de confirmación
    expect(wrapper.find('.checkout__confirmation').exists()).toBe(true)
    expect(wrapper.text()).toContain('¡Gracias por tu compra!')
    expect(wrapper.text()).toContain('Número de pedido:')
    expect(wrapper.text()).toContain('ORD-')
    expect(wrapper.text()).toContain('jesus@example.com')
    expect(wrapper.text()).toContain('Laptop Pro x 1')

    // El carrito se debe haber vaciado
    expect(clearSpy).toHaveBeenCalledOnce()
    expect(cart.items).toHaveLength(0)

    // Enlace para volver
    const backBtn = wrapper.findComponent(RouterLinkStub)
    expect(backBtn.props('to')).toEqual({ name: 'catalog' })
  })
})

