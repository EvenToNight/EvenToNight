import { createRouter, createWebHistory } from 'vue-router'
import VueHomeView from '../views/VueHomeView.vue'
import Home from '../views/Home.vue'
import PlaceHolderView from '../views/PlaceHolderView.vue'
import LocaleWrapper from '../views/LocaleWrapper.vue'
import i18n, { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n'

// Get initial locale from localStorage or browser
const getInitialLocale = (): string => {
  const savedLocale = localStorage.getItem('user-locale')
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale
  }

  const navigatorLocale = navigator.language || (navigator as any).userLanguage
  if (!navigatorLocale) {
    return DEFAULT_LOCALE
  }

  const languageCode = navigatorLocale.split('-')[0]
  return SUPPORTED_LOCALES.includes(languageCode) ? languageCode : DEFAULT_LOCALE
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        return `/${getInitialLocale()}`
      },
    },
    {
      path: '/:locale',
      component: LocaleWrapper,
      children: [
        {
          path: 'placeholder',
          name: 'placeholder',
          component: PlaceHolderView,
        },
        {
          path: '',
          name: 'home',
          component: Home,
        },
        {
          path: 'vue-home',
          name: 'vue-home',
          component: VueHomeView,
        },
        {
          path: 'location',
          name: 'location',
          component: () => import('../views/LocationTestView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: ':pathMatch(.*)*',
          name: 'not-found',
          component: PlaceHolderView,
        },
      ],
    },
  ],
})

// Global navigation guard to handle locale changes
router.beforeEach((to, _from, next) => {
  const locale = to.params.locale as string

  // Validate locale
  if (locale && !SUPPORTED_LOCALES.includes(locale)) {
    return next(`/${DEFAULT_LOCALE}`)
  }

  // Update i18n locale
  if (locale && i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale as Locale
    localStorage.setItem('user-locale', locale)
  }

  next()
})

export default router
