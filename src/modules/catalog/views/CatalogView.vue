<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCatalogStore } from '../store'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'
import CatalogFilters from '../components/CatalogFilters.vue'
import ProductCard from '../components/ProductCard.vue'
import BaseButton from '@/shared/components/BaseButton.vue'

const catalog = useCatalogStore()
const sentinel = ref(null)

useInfiniteScroll(sentinel, () => catalog.fetchNextPage(), {
  watchSource: () => catalog.products.length,
})

onMounted(() => {
  catalog.loadCategories()
  // Al volver del detalle la lista ya está cargada y se conserva
  if (!catalog.products.length) catalog.fetchNextPage()
})

const statusMessage = computed(() => {
  if (catalog.isLoading) return 'Cargando productos'
  if (catalog.status === 'error') return 'No se pudieron cargar los productos'
  if (catalog.isEmpty) return 'No se encontraron productos'
  return `Mostrando ${catalog.products.length} de ${catalog.total} productos`
})
</script>

<template>
  <section class="catalog">
    <h1>Catálogo</h1>

    <CatalogFilters
      :search="catalog.search"
      :category="catalog.category"
      :categories="catalog.categories"
      @update:search="catalog.setSearch"
      @update:category="catalog.setCategory"
    />

    <p class="sr-only" role="status">{{ statusMessage }}</p>

    <div v-if="catalog.isEmpty" class="catalog__message">
      <p>No se encontraron productos.</p>
      <BaseButton variant="secondary" @click="catalog.clearFilters()">Limpiar filtros</BaseButton>
    </div>

    <ul v-else class="catalog__grid">
      <li v-for="product in catalog.products" :key="product.id">
        <ProductCard :product="product" />
      </li>
    </ul>

    <div ref="sentinel" class="catalog__message">
      <p v-if="catalog.isLoading">Cargando productos...</p>
      <template v-else-if="catalog.status === 'error'">
        <p>No se pudieron cargar los productos.</p>
        <BaseButton @click="catalog.fetchNextPage()">Reintentar</BaseButton>
      </template>
      <BaseButton v-else-if="catalog.hasMore" variant="secondary" @click="catalog.fetchNextPage()">
        Cargar más
      </BaseButton>
      <p v-else-if="catalog.products.length">Ya viste todos los productos.</p>
    </div>
  </section>
</template>

<style scoped>
.catalog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space);
  padding: 0;
  margin: var(--space) 0;
  list-style: none;
}
.catalog__message {
  padding: var(--space) 0;
  text-align: center;
}
</style>
