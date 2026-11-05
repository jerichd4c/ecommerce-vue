import { createRouter, createWebHistory } from 'vue-router'
import catalogRoutes from '@/modules/catalog/routes'
import productRoutes from '@/modules/product/routes'
import cartRoutes from '@/modules/cart/routes'
import authRoutes from '@/modules/auth/routes'
import checkoutRoutes from '@/modules/checkout/routes'
import { authGuard } from '@/modules/auth/guards'
import { setPageTitle } from '@/shared/utils/pageTitle'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...catalogRoutes,
    ...productRoutes,
    ...cartRoutes,
    ...authRoutes,
    ...checkoutRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/shared/views/NotFoundView.vue'),
      meta: { title: 'Página no encontrada' },
    },
  ],
  scrollBehavior(to, from, saved) {
    return saved || { top: 0 }
  },
})

router.beforeEach(authGuard)

router.afterEach((to) => setPageTitle(to.meta.title))

export default router
