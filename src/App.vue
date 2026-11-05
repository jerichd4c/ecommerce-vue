<script setup>
import { nextTick, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppHeader from '@/shared/components/AppHeader.vue'
import { useAuthStore } from '@/modules/auth/store'
import { useCartStore } from '@/modules/cart/store'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const main = ref(null)

// Al cambiar de página el enlace que se usó desaparece y el foco se pierde.
// Se lleva al contenido principal para que el teclado y el lector de pantalla sigan desde ahí.
watch(
  () => route.path,
  (to, from) => {
    if (!from) return // primera carga: el foco se queda donde lo pone el navegador
    nextTick(() => main.value?.focus({ preventScroll: true }))
  },
)

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
  <main id="main" ref="main" class="container" tabindex="-1">
    <RouterView />
  </main>
</template>

<style scoped>
/* main solo recibe foco por código (tabindex="-1"); no es un control, no necesita contorno */
main:focus {
  outline: none;
}
</style>
