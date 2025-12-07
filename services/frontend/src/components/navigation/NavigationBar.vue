<script lang="ts">
export const NAVBAR_HEIGHT = 64
export const MOBILE_BREAKPOINT = 800
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SearchBar from './SearchBar.vue'
import { useNavigation } from '@/router/utils'

interface Props {
  showSearch?: boolean
  searchQuery?: string
  hasFocus?: boolean
}

const props = defineProps<Props>()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()
const { goToLogin, goToRegister, goToHome, goToUserProfile } = useNavigation()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:hasFocus': [value: boolean]
}>()

const mobileSearchOpen = ref(false)
const mobileMenuOpen = ref(false)
const searchQuery = ref(props.searchQuery)
const searchBarHasFocus = ref(props.hasFocus)

watch(
  () => props.searchQuery,
  (value) => {
    searchQuery.value = value
  }
)

watch(
  () => props.hasFocus,
  (value) => {
    searchBarHasFocus.value = value
    mobileSearchOpen.value = value
  }
)

watch(searchBarHasFocus, (value) => {
  emit('update:hasFocus', value)
})

const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)

const showMobileSearch = computed(() => {
  return searchBarHasFocus.value && props.showSearch && isMobile.value
})

const updateSearchQuery = (value: string) => {
  emit('update:searchQuery', value)
}

const handleSignIn = () => {
  goToLogin()
}

const handleSignUp = () => {
  goToRegister()
}

const toggleMobileSearch = () => {
  if (mobileSearchOpen.value) {
    mobileSearchOpen.value = false
    emit('update:searchQuery', '')
    emit('update:hasFocus', false)
  } else {
    mobileSearchOpen.value = true
    emit('update:hasFocus', true)
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const handleSignInAndClose = () => {
  handleSignIn()
  closeMobileMenu()
}

const handleSignUpAndClose = () => {
  handleSignUp()
  closeMobileMenu()
}

const handleLogout = async () => {
  await authStore.logout()
  goToHome()
}

const goToProfile = () => {
  if (authStore.user) {
    goToUserProfile(authStore.user.id)
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'auto', //'smooth',
  })
}
</script>

<template>
  <div class="navbar-wrapper">
    <q-toolbar class="navigation-bar">
      <!-- Mobile search bar (full width) -->
      <div v-if="showMobileSearch" class="mobile-search-bar">
        <div class="mobile-search-container">
          <SearchBar
            v-model:search-query="searchQuery"
            v-model:has-focus="searchBarHasFocus"
            :autofocus="hasFocus"
            @update:search-query="updateSearchQuery"
          />
        </div>
        <q-btn flat dense icon="close" @mousedown.prevent="toggleMobileSearch" />
      </div>

      <template v-else>
        <q-toolbar-title class="brand-title">
          <router-link to="/" class="brand-link" @click="scrollToTop">
            <img src="/logo.png" alt="EvenToNight Logo" class="brand-icon" />
            <span class="brand-text">EvenToNight</span>
          </router-link>
        </q-toolbar-title>
        <q-space />
        <div v-if="showSearch" class="search-container">
          <SearchBar
            v-model:search-query="searchQuery"
            v-model:has-focus="searchBarHasFocus"
            :autofocus="hasFocus"
            @update:search-query="updateSearchQuery"
          />
        </div>

        <q-space v-if="showSearch" class="desktop-space" />
        <q-btn
          v-if="showSearch"
          flat
          dense
          icon="search"
          class="search-icon-mobile"
          @click="toggleMobileSearch"
        />

        <!-- Authenticated user avatar -->
        <div v-if="authStore.isAuthenticated" class="user-menu">
          <q-btn flat round>
            <q-avatar size="40px">
              <img
                :src="authStore.user?.avatarUrl || '/default-avatar.png'"
                :alt="authStore.user?.name"
              />
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 200px">
                <q-item clickable @click="goToProfile">
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>{{ t('nav.profile') }}</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>{{ t('nav.logout') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <!-- Login/Register buttons for guests -->
        <div v-else class="auth-buttons">
          <q-btn
            flat
            :label="t('nav.login')"
            class="q-mr-sm sign-in-btn"
            color="primary"
            @click="handleSignIn"
          />
          <q-btn
            unelevated
            :label="t('nav.register')"
            color="primary"
            class="sign-up-btn"
            @click="handleSignUp"
          />
        </div>

        <!-- Hamburger menu icon (mobile only) -->
        <q-btn flat dense icon="menu" class="hamburger-menu-mobile" @click="toggleMobileMenu" />
      </template>
    </q-toolbar>

    <!-- Extra overlay for drawer -->
    <Transition name="overlay-fade">
      <div v-if="mobileMenuOpen" class="drawer-body-overlay" @click="closeMobileMenu"></div>
    </Transition>

    <!-- Mobile menu drawer -->
    <Transition name="drawer">
      <div v-if="mobileMenuOpen" class="mobile-drawer-overlay" @click="closeMobileMenu">
        <div class="mobile-drawer" @click.stop>
          <div class="mobile-drawer-header">
            <q-btn flat dense icon="close" @click="closeMobileMenu" />
          </div>
          <div class="mobile-drawer-content">
            <!-- Authenticated user -->
            <div v-if="authStore.isAuthenticated" class="mobile-user-section">
              <div class="mobile-user-info">
                <q-avatar size="60px">
                  <img
                    :src="authStore.user?.avatarUrl || '/default-avatar.png'"
                    :alt="authStore.user?.name"
                  />
                </q-avatar>
                <div class="mobile-user-details">
                  <div class="mobile-user-name">{{ authStore.user?.name }}</div>
                  <div class="mobile-user-email">{{ authStore.user?.email }}</div>
                </div>
              </div>
              <q-separator class="q-my-md" />
              <div class="mobile-drawer-buttons">
                <q-btn
                  flat
                  icon="person"
                  :label="t('nav.profile')"
                  color="primary"
                  class="full-width mobile-menu-btn"
                  @click="(goToProfile(), closeMobileMenu())"
                />
                <q-btn
                  flat
                  icon="logout"
                  :label="t('nav.logout')"
                  color="negative"
                  class="full-width mobile-menu-btn"
                  @click="(handleLogout(), closeMobileMenu())"
                />
              </div>
            </div>

            <!-- Guest buttons -->
            <div v-else class="mobile-drawer-buttons">
              <q-btn
                flat
                :label="t('nav.login')"
                color="primary"
                class="full-width mobile-menu-btn"
                @click="handleSignInAndClose"
              />
              <q-btn
                unelevated
                :label="t('nav.register')"
                color="primary"
                class="full-width mobile-menu-btn"
                @click="handleSignUpAndClose"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
.navbar-wrapper {
  min-width: 300px;
  width: 100%;

  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
}

.navigation-bar {
  min-width: 300px;
  width: 100%;
  min-height: 64px;
  transition: background-color 0.3s ease;
  position: relative;

  @include light-mode {
    background-color: white !important;
  }

  @include dark-mode {
    background-color: #1d1d1d !important;
  }

  // Force min-width on internal q-toolbar
  .q-toolbar {
    min-width: 300px;
    width: 100%;
  }
}

.brand-title {
  flex: 0 1 auto;
  margin-right: $spacing-2;
  min-width: 0;
}

.brand-link {
  text-decoration: none;
  color: $color-primary !important;
  font-weight: 600;
  transition: opacity $transition-base;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: $spacing-2;

  &:hover {
    opacity: 0.8;
  }

  .brand-icon {
    flex-shrink: 0;
    height: 32px;
    width: auto;
    object-fit: contain;
  }

  .brand-text {
    color: $color-primary;

    @media (max-width: $breakpoint-mobile) {
      display: none;
    }
  }
}

.search-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: clamp(200px, 40vw, 500px);
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  @media (max-width: $breakpoint-mobile) {
    display: none;
  }
}

.search-icon-mobile {
  display: none;
  flex-shrink: 0;

  @media (max-width: $breakpoint-mobile) {
    display: inline-flex;
  }
}

.desktop-space {
  @media (max-width: $breakpoint-mobile) {
    display: none;
  }
}

.auth-buttons {
  flex: 0 1 auto;
  display: flex;
  align-items: center;
  gap: $spacing-1;
  white-space: nowrap;
  min-width: 0;

  .q-btn {
    min-width: 60px;
    padding: 0 8px;
  }

  @media (max-width: $breakpoint-mobile) {
    display: none;
  }
}

.hamburger-menu-mobile {
  display: none;
  flex-shrink: 0;

  @media (max-width: $breakpoint-mobile) {
    display: inline-flex;
  }
}

.mobile-search-bar {
  display: flex;
  align-items: flex-start;
  gap: $spacing-2;
  width: 100%;

  .mobile-search-container {
    flex: 1;
    position: relative;
    width: 100%;
  }

  > .q-btn {
    flex-shrink: 0;
  }
}

.mobile-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  //background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;

  @media (max-width: $breakpoint-mobile) {
    // Su mobile usa absolute per essere solidale con l'app, non con la viewport
    position: absolute;
  }
}

.mobile-drawer {
  width: 300px;
  max-width: 80vw;
  min-width: 240px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  @include dark-mode {
    background: #1d1d1d;
  }

  @media (max-width: $breakpoint-mobile) {
    // Assicura che l'altezza sia relativa al contenitore
    height: 100vh;
    position: sticky;
    top: 0;
  }
}

.mobile-drawer-header {
  display: flex;
  justify-content: flex-end;
  padding: $spacing-4;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  @include dark-mode {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

.mobile-drawer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: $spacing-10;
}

.mobile-drawer-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.mobile-menu-btn {
  height: 48px;
  font-size: 16px;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;

  .mobile-drawer {
    transition: transform 0.3s ease;
  }
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;

  .mobile-drawer {
    transform: translateX(100%);
  }
}

.drawer-enter-to,
.drawer-leave-from {
  opacity: 1;

  .mobile-drawer {
    transform: translateX(0);
  }
}

.user-menu {
  display: flex;
  align-items: center;

  @media (max-width: $breakpoint-mobile) {
    display: none;
  }
}

.mobile-user-section {
  display: flex;
  flex-direction: column;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 0;
}

.mobile-user-details {
  flex: 1;
  min-width: 0;
}

.mobile-user-name {
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @include light-mode {
    color: #1d1d1d;
  }

  @include dark-mode {
    color: #ffffff;
  }
}

.mobile-user-email {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;

  @include light-mode {
    color: #666;
  }

  @include dark-mode {
    color: #aaa;
  }
}

.drawer-body-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9998;
  cursor: pointer;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.overlay-fade-enter-to,
.overlay-fade-leave-from {
  opacity: 1;
}
</style>
