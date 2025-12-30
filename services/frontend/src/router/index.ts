import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/HomeView.vue'
import PlaceHolderView from '../views/PlaceHolderView.vue'
import LocaleWrapper from '../views/LocaleWrapper.vue'
import i18n, { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n'
import { requireGuest, requireRole, requireEventCreator, requireNotDraft } from './guards'

export const HOME_ROUTE_NAME = 'home'
export const LOGIN_ROUTE_NAME = 'login'
export const REGISTER_ROUTE_NAME = 'register'
export const EVENT_DETAILS_ROUTE_NAME = 'event-details'
export const EVENT_REVIEWS_ROUTE_NAME = 'event-reviews'
export const EXPLORE_ROUTE_NAME = 'explore'
export const USER_PROFILE_ROUTE_NAME = 'user-profile'
export const CREATE_EVENT_ROUTE_NAME = 'create-event'
export const EDIT_EVENT_ROUTE_NAME = 'edit-event'
export const FORBIDDEN_ROUTE_NAME = 'forbidden'

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
          name: EVENT_DETAILS_ROUTE_NAME,
          component: () => import('../views/EventDetailsView.vue'),
          beforeEnter: requireNotDraft,
        },
        {
          path: 'organization/:organizationId/reviews',
          name: EVENT_REVIEWS_ROUTE_NAME,
          component: () => import('../views/ReviewsView.vue'),
        },
        {
          path: 'explore',
          name: EXPLORE_ROUTE_NAME,
          component: () => import('../views/ExploreView.vue'),
        },
        {
          path: 'users/:id',
          name: USER_PROFILE_ROUTE_NAME,
          component: () => import('../views/UserProfileView.vue'),
        },
        {
          path: 'create-event',
          name: CREATE_EVENT_ROUTE_NAME,
          component: () => import('../views/CreateEventView.vue'),
          beforeEnter: requireRole('organization'),
        },
        {
          path: 'edit-event/:id',
          name: EDIT_EVENT_ROUTE_NAME,
          component: () => import('../views/CreateEventView.vue'),
          beforeEnter: requireEventCreator,
        },
        {
          path: 'forbidden',
          name: FORBIDDEN_ROUTE_NAME,
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
