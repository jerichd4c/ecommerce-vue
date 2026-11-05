<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/shared/components/BaseButton.vue'
import BaseInput from '@/shared/components/BaseInput.vue'
import { formatPrice } from '@/shared/utils/format'
import { useAuthStore } from '@/modules/auth/store'
import { useCartStore } from '@/modules/cart/store'
import { validateCheckout } from '../validators'

const auth = useAuthStore()
const cart = useCartStore()

const defaultName = computed(() => {
  if (!auth.user) return ''
  const parts = [auth.user.firstName, auth.user.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : auth.user.username || ''
})

const defaultEmail = computed(() => auth.user?.email || '')

const form = reactive({
  name: defaultName.value,
  email: defaultEmail.value,
  address: '',
  city: '',
  cardNumber: '',
  cardExp: '',
  cardCvv: '',
})

const errors = reactive({
  name: '',
  email: '',
  address: '',
  city: '',
  cardNumber: '',
  cardExp: '',
  cardCvv: '',
})

const isProcessing = ref(false)
const orderCompleted = ref(false)
const completedOrder = ref(null)

async function handleSubmit() {
  const result = validateCheckout(form)

  Object.assign(errors, result.errors)

  if (!result.isValid) {
    const firstErrorKey = Object.keys(errors).find((key) => errors[key])
    if (firstErrorKey) {
      await nextTick()
      document.getElementById(firstErrorKey)?.focus()
    }
    return
  }

  isProcessing.value = true

  // Simulación de envío con 1 segundo de retraso
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Guardar snapshot del pedido antes de vaciar el carrito
  completedOrder.value = {
    orderNumber: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    items: [...cart.items],
    total: cart.total,
    customerName: form.name,
    customerEmail: form.email,
    shippingAddress: `${form.address}, ${form.city}`,
  }

  orderCompleted.value = true
  isProcessing.value = false

  // Vaciar el carrito después de confirmar la orden
  cart.clear()
}
</script>

<template>
  <section class="checkout">
    <!-- Pantalla de confirmación de compra -->
    <div v-if="orderCompleted" class="checkout__confirmation" role="status">
      <h1>¡Gracias por tu compra!</h1>
      <p class="checkout__order-number">
        Número de pedido: <strong>#{{ completedOrder.orderNumber }}</strong>
      </p>
      <p>
        Hemos enviado la confirmación y detalles del envío a
        <strong>{{ completedOrder.customerEmail }}</strong
        >.
      </p>

      <div class="checkout__order-summary">
        <h2>Resumen de tu pedido</h2>
        <ul class="checkout__order-list">
          <li
            v-for="item in completedOrder.items"
            :key="item.product.id"
            class="checkout__order-item"
          >
            <span>{{ item.product.title }} x {{ item.qty }}</span>
            <strong>{{ formatPrice(item.product.price * item.qty) }}</strong>
          </li>
        </ul>
        <div class="checkout__order-total">
          <span>Total pagado:</span>
          <strong>{{ formatPrice(completedOrder.total) }}</strong>
        </div>
        <p class="checkout__shipping-info">
          Entrega a: {{ completedOrder.customerName }} ({{ completedOrder.shippingAddress }})
        </p>
      </div>

      <RouterLink :to="{ name: 'catalog' }" class="btn btn--primary checkout__back-btn">
        Volver a la tienda
      </RouterLink>
    </div>

    <!-- Estado de carrito vacío -->
    <div v-else-if="cart.items.length === 0" class="checkout__empty">
      <h1>Checkout</h1>
      <p>Tu carrito está vacío.</p>
      <RouterLink :to="{ name: 'catalog' }" class="btn btn--primary">
        Ver catálogo de productos
      </RouterLink>
    </div>

    <!-- Formulario de compra y resumen -->
    <div v-else class="checkout__content">
      <h1>Finalizar compra</h1>

      <div class="checkout__grid">
        <form class="checkout__form" novalidate @submit.prevent="handleSubmit">
          <fieldset class="checkout__fieldset">
            <legend>Información de envío</legend>

            <BaseInput
              id="name"
              v-model="form.name"
              label="Nombre completo"
              autocomplete="name"
              :error="errors.name"
            />

            <BaseInput
              id="email"
              v-model="form.email"
              label="Correo electrónico"
              type="email"
              autocomplete="email"
              :error="errors.email"
            />

            <BaseInput
              id="address"
              v-model="form.address"
              label="Dirección de entrega"
              autocomplete="street-address"
              :error="errors.address"
            />

            <BaseInput
              id="city"
              v-model="form.city"
              label="Ciudad"
              autocomplete="address-level2"
              :error="errors.city"
            />
          </fieldset>

          <fieldset class="checkout__fieldset">
            <legend>Detalles de pago (Simulado)</legend>

            <BaseInput
              id="cardNumber"
              v-model="form.cardNumber"
              label="Número de tarjeta (16 dígitos)"
              autocomplete="cc-number"
              inputmode="numeric"
              placeholder="1234 5678 9012 3456"
              :error="errors.cardNumber"
            />

            <div class="checkout__row">
              <BaseInput
                id="cardExp"
                v-model="form.cardExp"
                label="Vencimiento (MM/AA)"
                autocomplete="cc-exp"
                placeholder="MM/AA"
                :error="errors.cardExp"
              />

              <BaseInput
                id="cardCvv"
                v-model="form.cardCvv"
                label="CVV"
                type="password"
                autocomplete="cc-csc"
                inputmode="numeric"
                maxlength="4"
                placeholder="123"
                :error="errors.cardCvv"
              />
            </div>
          </fieldset>

          <BaseButton type="submit" :disabled="isProcessing" class="checkout__submit-btn">
            {{ isProcessing ? 'Procesando...' : `Pagar ${formatPrice(cart.total)}` }}
          </BaseButton>
        </form>

        <!-- Resumen del pedido -->
        <aside class="checkout__summary" aria-label="Resumen del pedido">
          <h2>Resumen del pedido</h2>
          <ul class="checkout__summary-list">
            <li v-for="item in cart.items" :key="item.product.id" class="checkout__summary-item">
              <div class="checkout__summary-title">
                <span>{{ item.product.title }}</span>
                <span class="checkout__summary-qty">Cantidad: {{ item.qty }}</span>
              </div>
              <strong class="checkout__summary-subtotal">
                {{ formatPrice(item.product.price * item.qty) }}
              </strong>
            </li>
          </ul>

          <div class="checkout__summary-total">
            <span>Total a pagar:</span>
            <strong>{{ formatPrice(cart.total) }}</strong>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
.checkout {
  padding: var(--space) 0;
}

.checkout__empty,
.checkout__confirmation {
  max-width: 600px;
  margin: calc(var(--space) * 2) auto;
  text-align: center;
  background: var(--color-bg);
  border: 1px solid var(--color-skeleton);
  border-radius: var(--radius);
  padding: calc(var(--space) * 2);
}

.checkout__order-number {
  font-size: 1.25rem;
  color: var(--color-primary);
  margin-bottom: var(--space);
}

.checkout__order-summary {
  margin: var(--space) 0;
  padding: var(--space);
  background: var(--color-skeleton);
  border-radius: var(--radius);
  text-align: left;
}

.checkout__order-summary h2 {
  font-size: 1.125rem;
  margin-top: 0;
}

.checkout__order-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space) 0;
}

.checkout__order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0;
  border-bottom: 1px dashed #ccc;
}

.checkout__order-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.125rem;
  padding-top: 0.5rem;
}

.checkout__shipping-info {
  margin: 0.75rem 0 0 0;
  font-size: 0.875rem;
  color: #555;
}

.checkout__back-btn {
  display: inline-block;
  text-decoration: none;
  margin-top: var(--space);
}

.checkout__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: calc(var(--space) * 2);
  align-items: start;
}

@media (min-width: 768px) {
  .checkout__grid {
    grid-template-columns: 3fr 2fr;
  }
}

.checkout__fieldset {
  border: 1px solid var(--color-skeleton);
  border-radius: var(--radius);
  padding: var(--space);
  margin-bottom: var(--space);
}

.checkout__fieldset legend {
  font-weight: 600;
  padding: 0 0.5rem;
}

.checkout__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space);
}

.checkout__submit-btn {
  width: 100%;
  font-size: 1.1rem;
  padding: 0.8rem;
}

.checkout__submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.checkout__summary {
  background: var(--color-bg);
  border: 1px solid var(--color-skeleton);
  border-radius: var(--radius);
  padding: var(--space);
}

.checkout__summary h2 {
  margin-top: 0;
  font-size: 1.25rem;
  border-bottom: 1px solid var(--color-skeleton);
  padding-bottom: 0.5rem;
}

.checkout__summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.checkout__summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-skeleton);
}

.checkout__summary-title {
  display: flex;
  flex-direction: column;
}

.checkout__summary-qty {
  font-size: 0.875rem;
  color: #666;
}

.checkout__summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.25rem;
  padding-top: var(--space);
}
</style>
