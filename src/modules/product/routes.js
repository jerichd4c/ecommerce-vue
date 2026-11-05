export default [
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('./views/ProductDetailView.vue'),
    props: true,
    // La vista lo reemplaza por el nombre del producto cuando termina de cargar
    meta: { title: 'Detalle del producto' },
  },
]
