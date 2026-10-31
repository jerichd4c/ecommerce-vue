<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '@/shared/components/AppHeader.vue'
</script>

<template>
  <a href="#main" class="skip-link">Saltar al contenido</a>
  <AppHeader />
  <main id="main" class="container">
    <RouterView />
  </main>
</template>
