<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import BaseInput from '@/shared/components/BaseInput.vue'

const props = defineProps({
  search: { type: String, default: '' },
  category: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:search', 'update:category'])

const searchText = ref(props.search)
let timer

// Espera a que el usuario deje de escribir antes de buscar
watch(searchText, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:search', value), 400)
})

// Si el store limpia la búsqueda (botón "Limpiar filtros"), el campo también se limpia
watch(
  () => props.search,
  (value) => {
    searchText.value = value
  },
)

function submit() {
  clearTimeout(timer)
  emit('update:search', searchText.value)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <form class="catalog-filters" role="search" @submit.prevent="submit">
    <BaseInput
      v-model="searchText"
      label="Buscar productos"
      type="search"
      placeholder="Ej. phone"
    />
    <div class="field">
      <label for="category-filter">Categoría</label>
      <select
        id="category-filter"
        :value="category"
        @change="emit('update:category', $event.target.value)"
      >
        <option value="">Todas</option>
        <option v-for="c in categories" :key="c.slug" :value="c.slug">{{ c.name }}</option>
      </select>
    </div>
  </form>
</template>

<style scoped>
.catalog-filters {
  display: grid;
  gap: 0 var(--space);
}
@media (min-width: 640px) {
  .catalog-filters {
    grid-template-columns: 2fr 1fr;
  }
}
</style>
