import { createRouter, createWebHistory } from 'vue-router'
import VueHomeView from '../views/VueHomeView.vue'
import Home from '../views/Home.vue'
import PlaceHolderView from '../views/PlaceHolderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/placeholder',
      name: 'placeholder',
      component: PlaceHolderView,
    },
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/vue-home',
      name: 'vue-home',
      component: VueHomeView,
    },
    {
      path: '/location',
      name: 'location',
      component: () => import('../views/LocationTestView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: PlaceHolderView,
    },
  ],
})

export default router
