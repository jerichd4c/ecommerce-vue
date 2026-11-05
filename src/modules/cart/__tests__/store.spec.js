import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../store'

const camisa = { id: 1, title: 'Camisa', price: 10 }
const gorra = { id: 2, title: 'Gorra', price: 5.5 }

describe('useCartStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('agrega un producto nuevo con cantidad 1', () => {
    const cart = useCartStore()
    cart.addItem(camisa)

    expect(cart.items).toEqual([{ product: camisa, qty: 1 }])
  })

  it('suma 1 si el producto ya estaba', () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    cart.addItem(camisa)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].qty).toBe(2)
  })

  it('calcula la cantidad y el total', () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    cart.addItem(camisa)
    cart.addItem(gorra)

    expect(cart.count).toBe(3)
    expect(cart.total).toBe(25.5)
  })

  it('quita un producto', () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    cart.addItem(gorra)
    cart.removeItem(camisa.id)

    expect(cart.items.map((i) => i.product.id)).toEqual([gorra.id])
  })

  it('cambia la cantidad', () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    cart.setQty(camisa.id, 4)

    expect(cart.items[0].qty).toBe(4)
    expect(cart.total).toBe(40)
  })

  it('quita el producto si la cantidad es 0 o menos', () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    cart.setQty(camisa.id, 0)

    expect(cart.items).toEqual([])
  })

  it('ignora una cantidad que no sea un entero', () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    cart.setQty(camisa.id, Number.NaN)
    cart.setQty(camisa.id, 1.5)

    expect(cart.items[0].qty).toBe(1)
  })

  it('vacía el carrito', () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    cart.clear()

    expect(cart.items).toEqual([])
    expect(cart.total).toBe(0)
  })

  it('recupera el carrito al recargar la página', async () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    cart.setQty(camisa.id, 3)
    await nextTick()

    setActivePinia(createPinia())
    const recargado = useCartStore()

    expect(recargado.items).toEqual([{ product: camisa, qty: 3 }])
  })

  it('guarda el carrito vacío después de clear', async () => {
    const cart = useCartStore()
    cart.addItem(camisa)
    await nextTick()
    cart.clear()
    await nextTick()

    setActivePinia(createPinia())

    expect(useCartStore().items).toEqual([])
  })

  it('empieza vacío si lo guardado está dañado', () => {
    localStorage.setItem('cart', '{no es json')

    expect(useCartStore().items).toEqual([])
  })
})
