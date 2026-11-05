export default [
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('./views/CheckoutView.vue'),
    meta: { requiresAuth: true, title: 'Finalizar compra' },
  },
]
