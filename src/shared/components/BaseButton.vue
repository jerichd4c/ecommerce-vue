<script setup>
defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' }, // primary | secondary | danger
})
</script>

<template>
  <button :type="type" class="btn" :class="`btn--${variant}`">
    <slot />
  </button>
</template>
