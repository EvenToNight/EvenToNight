import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import PlaceHolderView from '../views/PlaceHolderView.vue'
import LocaleWrapper from '../views/LocaleWrapper.vue'
import i18n, { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n'
import { requireGuest, requireRole } from './guards'

export const HOME_ROUTE_NAME = 'home'
export const LOGIN_ROUTE_NAME = 'login'
export const REGISTER_ROUTE_NAME = 'register'
export const EVENT_DETAILS_ROUTE_NAME = 'event-details'

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
          path: '',
          name: HOME_ROUTE_NAME,
          component: Home,
        },
        {
          path: 'login',
          name: LOGIN_ROUTE_NAME,
          component: () => import('../views/AuthView.vue'),
          beforeEnter: requireGuest,
        },
        {
          path: 'register',
          name: REGISTER_ROUTE_NAME,
          component: () => import('../views/AuthView.vue'),
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
          beforeEnter: requireRole('organization'),
        },
        {
          path: 'forbidden',
          name: 'forbidden',
          component: PlaceHolderView,
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
    const pathWithoutLocale = to.path.substring(locale.length + 1)
    return next(`/${DEFAULT_LOCALE}${pathWithoutLocale}`)
  }

  if (locale && i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale as Locale
    localStorage.setItem('user-locale', locale)
  }

  next()
})

export default router
