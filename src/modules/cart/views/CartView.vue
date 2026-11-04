<script setup>
import { RouterLink } from 'vue-router'
import { formatPrice } from '@/shared/utils/format'
import CartItem from '../components/CartItem.vue'
import { useCartStore } from '../store'

const cart = useCartStore()
</script>

<template>
  <section>
    <h1>Carrito</h1>

    <div v-if="cart.items.length === 0">
      <p>Tu carrito está vacío.</p>
      <RouterLink :to="{ name: 'catalog' }">Ver productos</RouterLink>
    </div>

    <template v-else>
      <ul class="cart-list">
        <CartItem v-for="item in cart.items" :key="item.product.id" :item="item" />
      </ul>
      <div class="cart-summary">
        <p class="cart-summary__total" aria-live="polite">
          Total ({{ cart.count }}): <strong>{{ formatPrice(cart.total) }}</strong>
        </p>
        <RouterLink :to="{ name: 'checkout' }" class="btn btn--primary cart-summary__checkout">
          Ir a pagar
        </RouterLink>
      </div>
    </template>
  </section>
</template>

<style scoped>
.cart-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.cart-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: var(--space);
}
.cart-summary__total {
  margin: 0;
  font-size: 1.125rem;
}
.cart-summary__checkout {
  text-align: center;
  text-decoration: none;
}

@media (min-width: 640px) {
  .cart-summary {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
