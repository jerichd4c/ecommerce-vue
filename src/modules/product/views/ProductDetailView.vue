<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/components/BaseButton.vue'
import LazyImage from '@/shared/components/LazyImage.vue'
import { formatPrice } from '@/shared/utils/format'
import { setPageTitle } from '@/shared/utils/pageTitle'
import { useCartStore } from '@/modules/cart/store'
import { useProductStore } from '../store'

const props = defineProps({
  id: { type: String, required: true },
})

const store = useProductStore()
const cart = useCartStore()
const added = ref(false)

const image = computed(() => store.product?.images?.[0] ?? store.product?.thumbnail)

watch(
  () => props.id,
  (id) => {
    added.value = false
    store.load(id)
  },
  { immediate: true },
)

watch(
  () => store.product?.title,
  (title) => {
    if (title) setPageTitle(title)
  },
)

function addToCart() {
  cart.addItem(store.product)
  added.value = true
}
</script>

<template>
  <section class="product">
    <RouterLink :to="{ name: 'catalog' }">Volver al catálogo</RouterLink>

    <div v-if="store.status === 'loading'" role="status">
      <h1>Cargando producto...</h1>
    </div>

    <div v-else-if="store.status === 'not-found'">
      <h1>Producto no encontrado</h1>
      <p>Este producto no existe o ya no está disponible.</p>
    </div>

    <div v-else-if="store.status === 'error'">
      <h1>No se pudo cargar el producto</h1>
      <p>Revisa tu conexión e inténtalo de nuevo.</p>
      <BaseButton @click="store.load(id)">Reintentar</BaseButton>
    </div>

    <article v-else-if="store.product" class="product__content">
      <LazyImage class="product__image" :src="image" :alt="store.product.title" />
      <div class="product__info">
        <h1 class="product__title">{{ store.product.title }}</h1>
        <p class="product__price">{{ formatPrice(store.product.price) }}</p>
        <p>{{ store.product.description }}</p>
        <BaseButton @click="addToCart">Agregar al carrito</BaseButton>
        <p role="status" class="product__status">
          <template v-if="added">
            Agregado al carrito.
            <RouterLink :to="{ name: 'cart' }">Ver carrito</RouterLink>
          </template>
        </p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.product__content {
  display: grid;
  gap: var(--space);
  margin-top: var(--space);
}
.product__image {
  border-radius: var(--radius);
}
.product__title {
  margin: 0;
}
.product__price {
  margin: 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
}
.product__status {
  min-height: 1.5rem;
}

@media (min-width: 640px) {
  .product__content {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: calc(var(--space) * 2);
  }
}
</style>
