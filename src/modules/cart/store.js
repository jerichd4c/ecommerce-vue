import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([]) // [{ product, qty }]

  const count = computed(() => items.value.reduce((n, i) => n + i.qty, 0))
  const total = computed(() => items.value.reduce((sum, i) => sum + i.product.price * i.qty, 0))

  function addItem(_product) {
    // TODO (Dev B)
  }
  function removeItem(_id) {
    // TODO (Dev B)
  }
  function setQty(_id, _qty) {
    // TODO (Dev B)
  }

  return { items, count, total, addItem, removeItem, setQty }
})
