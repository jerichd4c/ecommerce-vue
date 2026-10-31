import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref([])
  const search = ref('')
  const category = ref('')
  // TODO (Dev A): paginación, fetchNextPage, estados loading/error

  return { products, search, category }
})
