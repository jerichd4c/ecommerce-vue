export default [
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('./views/ProductDetailView.vue'),
    props: true,
  },
]
