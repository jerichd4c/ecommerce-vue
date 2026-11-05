<script setup>
import { RouterLink } from 'vue-router'
import LazyImage from '@/shared/components/LazyImage.vue'
import BaseButton from '@/shared/components/BaseButton.vue'
import { formatPrice } from '@/shared/utils/format'
import { useCartStore } from '@/modules/cart/store'

defineProps({
  product: { type: Object, required: true },
})

const cart = useCartStore()
</script>

<template>
  <article class="product-card">
    <RouterLink :to="{ name: 'product', params: { id: product.id } }" class="product-card__link">
      <LazyImage :src="product.thumbnail" :alt="product.title" />
      <h2 class="product-card__title">{{ product.title }}</h2>
    </RouterLink>
    <p class="product-card__price">{{ formatPrice(product.price) }}</p>
    <BaseButton @click="cart.addItem(product)">Agregar al carrito</BaseButton>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-skeleton);
  border-radius: var(--radius);
}
.product-card__link {
  color: inherit;
  text-decoration: none;
}
.product-card__link:hover .product-card__title {
  text-decoration: underline;
}
.product-card__title {
  margin: 0.5rem 0 0;
  font-size: 1rem;
}
.product-card__price {
  margin: auto 0 0;
  font-weight: 700;
}
</style>
