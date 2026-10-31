<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
})

const el = ref(null)
const visible = ref(false)
const loaded = ref(false)
let observer

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true
        observer.disconnect()
      }
    },
    { rootMargin: '200px' },
  )
  observer.observe(el.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="el" class="lazy-image" :class="{ 'is-loaded': loaded }">
    <img
      v-if="visible"
      :src="src"
      :alt="alt"
      decoding="async"
      @load="loaded = true"
      @error="loaded = true"
    />
  </div>
</template>

<style scoped>
.lazy-image {
  aspect-ratio: 1;
  background: var(--color-skeleton);
  overflow: hidden;
}
.lazy-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s;
}
.is-loaded img {
  opacity: 1;
}
</style>
