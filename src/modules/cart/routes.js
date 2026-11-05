export default [
  {
    path: '/cart',
    name: 'cart',
    component: () => import('./views/CartView.vue'),
    meta: { title: 'Carrito' },
  },
]
