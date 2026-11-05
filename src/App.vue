<script setup>
import { RouterView, useRouter } from 'vue-router'
import AppHeader from '@/shared/components/AppHeader.vue'
import { useAuthStore } from '@/modules/auth/store'
import { useCartStore } from '@/modules/cart/store'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

function handleLogout() {
  auth.logout()
  router.push({ name: 'catalog' })
}
</script>

<template>
  <a href="#main" class="skip-link">Saltar al contenido</a>
  <AppHeader
    :cart-count="cart.count"
    :is-authenticated="auth.isAuthenticated"
    @logout="handleLogout"
  />
  <main id="main" class="container">
    <RouterView />
  </main>
</template>
