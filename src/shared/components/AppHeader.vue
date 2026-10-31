<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <nav aria-label="Principal">
      <RouterLink to="/">Tienda</RouterLink>
      <RouterLink to="/cart">Carrito</RouterLink>
      <RouterLink to="/login">Iniciar sesión</RouterLink>
    </nav>
  </header>
</template>
