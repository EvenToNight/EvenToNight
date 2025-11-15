import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'
import HomeView from '../views/HomeView.vue'
import PlaceHolderView from '../views/PlaceHolderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'placeholder',
      component: PlaceHolderView,
    },
    {
      path: '/navigation',
      name: 'navigation',
      component: () => import('../views/NavigationView.vue') as Promise<Component>,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
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
  ],
})

export default router
