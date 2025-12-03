import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PlaceHolderView from '../views/PlaceHolderView.vue'
import LocaleWrapper from '../views/LocaleWrapper.vue'
import i18n, { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n'
import { requireGuest } from './guards'

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
          path: 'login',
          name: 'login',
          component: () => import('../views/Login.vue'),
          beforeEnter: requireGuest,
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../views/Login.vue'),
          beforeEnter: requireGuest,
        },
        {
          path: 'location',
          name: 'location',
          component: () => import('../views/LocationTestView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/AboutView.vue'),
        },
        {
          path: 'events/:id',
          name: 'event-details',
          component: () => import('../views/EventDetails.vue'),
        },
        {
          path: 'users/:id',
          name: 'user-profile',
          component: () => import('../views/UserProfile.vue'),
        },
        {
          path: 'create-event',
          name: 'create-event',
          component: () => import('../views/CreateEvent.vue'),
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

router.beforeEach((to, _from, next) => {
  const locale = to.params.locale as string

  if (locale && !SUPPORTED_LOCALES.includes(locale)) {
    return next(`/${DEFAULT_LOCALE}`)
  }

  if (locale && i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale as Locale
    localStorage.setItem('user-locale', locale)
  }

  next()
})

export default router
