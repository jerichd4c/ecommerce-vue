<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/components/BaseButton.vue'
import LazyImage from '@/shared/components/LazyImage.vue'
import { formatPrice } from '@/shared/utils/format'
import { useCartStore } from '../store'

const props = defineProps({
  item: { type: Object, required: true },
})

const cart = useCartStore()
const subtotal = computed(() => props.item.product.price * props.item.qty)
</script>

<template>
  <li class="cart-item">
    <LazyImage class="cart-item__image" :src="item.product.thumbnail" :alt="item.product.title" />
    <div class="cart-item__info">
      <h2 class="cart-item__title">
        <RouterLink :to="{ name: 'product', params: { id: item.product.id } }">
          {{ item.product.title }}
        </RouterLink>
      </h2>
      <p class="cart-item__price">{{ formatPrice(item.product.price) }} c/u</p>
      <div class="cart-item__actions">
        <div class="cart-item__qty" role="group" :aria-label="`Cantidad de ${item.product.title}`">
          <BaseButton
            variant="secondary"
            :aria-label="`Quitar una unidad de ${item.product.title}`"
            :disabled="item.qty <= 1"
            @click="cart.setQty(item.product.id, item.qty - 1)"
          >
            −
          </BaseButton>
          <span aria-live="polite">{{ item.qty }}</span>
          <BaseButton
            variant="secondary"
            :aria-label="`Agregar una unidad de ${item.product.title}`"
            @click="cart.setQty(item.product.id, item.qty + 1)"
          >
            +
          </BaseButton>
        </div>
        <BaseButton
          variant="danger"
          :aria-label="`Quitar ${item.product.title} del carrito`"
          @click="cart.removeItem(item.product.id)"
        >
          Quitar
        </BaseButton>
      </div>
    </div>
    <p class="cart-item__subtotal">{{ formatPrice(subtotal) }}</p>
  </li>
</template>

<style scoped>
.cart-item {
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 0.75rem;
  padding: var(--space) 0;
  border-bottom: 1px solid var(--color-skeleton);
}
.cart-item__title {
  margin: 0;
  font-size: 1rem;
}
.cart-item__price {
  margin: 0.25rem 0 0.5rem;
}
.cart-item__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.cart-item__qty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.cart-item__qty span {
  min-width: 2ch;
  text-align: center;
}
.cart-item__qty button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.cart-item__subtotal {
  grid-column: 2;
  margin: 0;
  font-weight: 700;
}

@media (min-width: 640px) {
  .cart-item {
    grid-template-columns: 6rem 1fr auto;
  }
  .cart-item__subtotal {
    grid-column: 3;
  }
}
</style>
