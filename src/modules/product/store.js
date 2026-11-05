import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchProduct } from './api'

export const useProductStore = defineStore('product', () => {
  const product = ref(null)
  const status = ref('idle') // idle | loading | error | not-found

  // Al cambiar de producto se ignoran las respuestas que todavía no han llegado
  let requestId = 0

  async function load(id) {
    const current = ++requestId
    product.value = null
    status.value = 'loading'

    try {
      const data = await fetchProduct(id)
      if (current !== requestId) return

      product.value = data
      status.value = 'idle'
    } catch (error) {
      if (current !== requestId) return
      // http() solo entrega el mensaje de DummyJSON, no el código de estado
      status.value = /not found/i.test(error.message) ? 'not-found' : 'error'
    }
  }

  return { product, status, load }
})
