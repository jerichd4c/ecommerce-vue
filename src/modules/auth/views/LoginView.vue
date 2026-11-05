<script setup>
import { nextTick, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import { useAuthStore } from '../store'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const apiError = ref('')

const errors = reactive({
  username: '',
  password: '',
})

function validate() {
  errors.username = ''
  errors.password = ''
  let isValid = true

  if (!username.value.trim()) {
    errors.username = 'El nombre de usuario es obligatorio'
    isValid = false
  }

  if (!password.value) {
    errors.password = 'La contraseña es obligatoria'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  apiError.value = ''

  if (!validate()) {
    await nextTick()
    if (errors.username) {
      document.getElementById('username')?.focus()
    } else if (errors.password) {
      document.getElementById('password')?.focus()
    }
    return
  }

  isLoading.value = true

  try {
    await auth.login({
      username: username.value.trim(),
      password: password.value,
    })

    const redirect = route.query.redirect
    const isSafe =
      typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')

    if (isSafe) {
      router.push(redirect)
    } else {
      router.push({ name: 'catalog' })
    }
  } catch (err) {
    apiError.value = err.message || 'Error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="login">
    <div class="login__card">
      <h1>Iniciar sesión</h1>

      <div class="login__demo" aria-label="Credenciales de demostración">
        <p class="login__demo-title">Usuario de prueba:</p>
        <p class="login__demo-item">Usuario: <code>emilys</code></p>
        <p class="login__demo-item">Contraseña: <code>emilyspass</code></p>
      </div>

      <p v-if="apiError" class="login__error" role="alert">
        {{ apiError }}
      </p>

      <form novalidate @submit.prevent="handleSubmit">
        <BaseInput
          id="username"
          v-model="username"
          label="Usuario"
          autocomplete="username"
          :error="errors.username"
        />

        <BaseInput
          id="password"
          v-model="password"
          label="Contraseña"
          type="password"
          autocomplete="current-password"
          :error="errors.password"
        />

        <BaseButton type="submit" :disabled="isLoading" class="login__submit">
          {{ isLoading ? 'Ingresando...' : 'Iniciar sesión' }}
        </BaseButton>
      </form>
    </div>
  </section>
</template>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  padding: calc(var(--space) * 2) 0;
}

.login__card {
  width: 100%;
  max-width: 420px;
  background: var(--color-bg);
  border: 1px solid var(--color-skeleton);
  border-radius: var(--radius);
  padding: calc(var(--space) * 1.5);
}

.login__card h1 {
  margin-top: 0;
  margin-bottom: var(--space);
  font-size: 1.5rem;
  text-align: center;
}

.login__demo {
  background: var(--color-skeleton);
  border-radius: var(--radius);
  padding: 0.75rem var(--space);
  margin-bottom: var(--space);
  font-size: 0.875rem;
}

.login__demo-title {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.login__demo-item {
  margin: 0.15rem 0;
}

.login__demo code {
  background: var(--color-bg);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-family: monospace;
}

.login__error {
  color: var(--color-danger);
  background: rgba(198, 40, 40, 0.08);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius);
  padding: 0.6rem var(--space);
  margin-bottom: var(--space);
  font-size: 0.875rem;
}

.login__submit {
  width: 100%;
  margin-top: 0.5rem;
}

.login__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
