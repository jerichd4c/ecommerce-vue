import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'cart'

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref(loadItems()) // [{ product, qty }]

  const count = computed(() => items.value.reduce((n, i) => n + i.qty, 0))
  const total = computed(() => items.value.reduce((sum, i) => sum + i.product.price * i.qty, 0))

  function addItem(product) {
    const item = items.value.find((i) => i.product.id === product.id)
    if (item) {
      item.qty += 1
    } else {
      items.value.push({ product, qty: 1 })
    }
  }

  function removeItem(id) {
    items.value = items.value.filter((i) => i.product.id !== id)
  }

  function setQty(id, qty) {
    if (!Number.isInteger(qty)) return
    if (qty <= 0) {
      removeItem(id)
      return
    }
    const item = items.value.find((i) => i.product.id === id)
    if (item) item.qty = qty
  }

  function clear() {
    items.value = []
  }

  watch(items, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })

  return { items, count, total, addItem, removeItem, setQty, clear }
})
