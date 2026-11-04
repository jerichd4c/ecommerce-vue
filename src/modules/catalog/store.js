import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchProducts, fetchCategories } from './api'

const PAGE_SIZE = 20

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref([])
  const total = ref(0)
  const search = ref('')
  const category = ref('')
  const categories = ref([])
  const status = ref('idle') // idle | loading | error
  const loaded = ref(false) // ya llegó al menos una respuesta con estos filtros

  // Cada búsqueda nueva invalida las respuestas que todavía no han llegado
  let requestId = 0

  const isLoading = computed(() => status.value === 'loading')
  const hasMore = computed(() => !loaded.value || products.value.length < total.value)
  const isEmpty = computed(() => loaded.value && products.value.length === 0)

  async function fetchNextPage() {
    if (isLoading.value || !hasMore.value) return

    const id = requestId
    status.value = 'loading'

    try {
      const data = await fetchProducts({
        search: search.value,
        category: category.value,
        skip: products.value.length,
        limit: PAGE_SIZE,
      })
      if (id !== requestId) return

      products.value.push(...data.products)
      total.value = data.total
      loaded.value = true
      status.value = 'idle'
    } catch {
      if (id !== requestId) return
      status.value = 'error'
    }
  }

  function reset() {
    requestId++
    products.value = []
    total.value = 0
    loaded.value = false
    status.value = 'idle'
  }

  function setSearch(value) {
    const text = value.trim()
    if (text === search.value) return
    search.value = text
    reset()
    fetchNextPage()
  }

  function setCategory(value) {
    if (value === category.value) return
    category.value = value
    reset()
    fetchNextPage()
  }

  function clearFilters() {
    search.value = ''
    category.value = ''
    reset()
    fetchNextPage()
  }

  async function loadCategories() {
    if (categories.value.length) return
    try {
      categories.value = await fetchCategories()
    } catch {
      // Sin categorías el catálogo sigue funcionando; el filtro solo muestra "Todas"
    }
  }

  return {
    products,
    total,
    search,
    category,
    categories,
    status,
    isLoading,
    hasMore,
    isEmpty,
    fetchNextPage,
    setSearch,
    setCategory,
    clearFilters,
    loadCategories,
  }
})
