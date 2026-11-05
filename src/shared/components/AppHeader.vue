<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  cartCount: { type: Number, default: 0 },
  isAuthenticated: { type: Boolean, default: false },
})

const emit = defineEmits(['logout'])

const cartLabel = computed(() => {
  const unit = props.cartCount === 1 ? 'producto' : 'productos'
  return `Carrito, ${props.cartCount} ${unit}`
})
</script>

<template>
  <header class="app-header">
    <nav class="app-header__nav" aria-label="Principal">
      <RouterLink class="app-header__link" to="/">Tienda</RouterLink>
      <RouterLink class="app-header__link" to="/cart" :aria-label="cartLabel">
        Carrito
        <span class="app-header__count">{{ cartCount }}</span>
      </RouterLink>
      <BaseButton
        v-if="isAuthenticated"
        class="app-header__session"
        variant="secondary"
        @click="emit('logout')"
      >
        Cerrar sesión
      </BaseButton>
      <RouterLink v-else class="app-header__link app-header__session" to="/login">
        Iniciar sesión
      </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid var(--color-skeleton);
}

.app-header__nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem var(--space);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.5rem var(--space);
}

.app-header__link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0;
  color: var(--color-primary);
  text-decoration: none;
}

.app-header__link:hover {
  text-decoration: underline;
}

.app-header__link[aria-current='page'] {
  font-weight: 700;
}

.app-header__count {
  min-width: 1.5rem;
  padding: 0 0.4rem;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.875rem;
  text-align: center;
}

.app-header__session {
  margin-left: auto;
}
</style>
