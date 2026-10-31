<script setup>
import { computed, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel()
const props = defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  id: { type: String, default: '' },
})

const autoId = useId()
const inputId = computed(() => props.id || autoId)
const errorId = computed(() => `${inputId.value}-error`)
</script>

<template>
  <div class="field">
    <label :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      v-model="model"
      :type="type"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      v-bind="$attrs"
    />
    <p v-if="error" :id="errorId" class="field-error" role="alert">{{ error }}</p>
  </div>
</template>
