<script lang="ts">
export const NAVBAR_HEIGHT = 64
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SearchBar from './SearchBar.vue'
import AppBrand from '@/components/common/AppBrand.vue'
import { useNavigation } from '@/router/utils'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
import AuthButtons from '../auth/AuthButtons.vue'
import DrawerMenu from './DrawerMenu.vue'
const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)

interface Props {
  showSearch?: boolean
  searchQuery?: string
  hasFocus?: boolean
}

const props = defineProps<Props>()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()
const { goToHome, goToUserProfile } = useNavigation()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:hasFocus': [value: boolean]
}>()

const mobileSearchOpen = ref(false) //TODO evaluate usage
const mobileMenuOpen = ref(false)

const searchQuery = computed({
  get: () => props.searchQuery ?? '',
  set: (value) => emit('update:searchQuery', value),
})

const searchBarHasFocus = computed({
  get: () => props.hasFocus ?? false,
  set: (value) => {
    emit('update:hasFocus', value)
    mobileSearchOpen.value = value
  },
})

const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)
const showMobileSearch = computed(() => {
  return searchBarHasFocus.value && props.showSearch && isMobile.value
})

const toggleMobileSearch = () => {
  if (mobileSearchOpen.value) {
    mobileSearchOpen.value = false
    searchQuery.value = ''
    searchBarHasFocus.value = false
  } else {
    mobileSearchOpen.value = true
    searchBarHasFocus.value = true
  }
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const handleLogout = async () => {
  await authStore.logout()
  toggleMobileMenu()
  goToHome()
}

const goToProfile = () => {
  if (authStore.user) {
    goToUserProfile(authStore.user.id)
    toggleMobileMenu()
  }
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
          />
        </div>
        <q-btn flat dense icon="close" @mousedown.prevent="toggleMobileSearch" />
      </div>

      <template v-else>
        <q-toolbar-title class="brand-title">
          <AppBrand />
        </q-toolbar-title>
        <q-space />
        <div v-if="showSearch" class="search-container">
          <SearchBar
            v-model:search-query="searchQuery"
            v-model:has-focus="searchBarHasFocus"
            :autofocus="hasFocus"
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
        <div v-else class="desktop-auth-buttons">
          <AuthButtons />
        </div>

        <!-- Hamburger menu icon (mobile only) -->
        <q-btn flat dense icon="menu" class="hamburger-menu-mobile" @click="toggleMobileMenu" />
      </template>
    </q-toolbar>

    <!-- Mobile menu drawer -->
    <DrawerMenu v-model:is-open="mobileMenuOpen">
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
            @click="goToProfile"
          />
          <q-btn
            flat
            icon="logout"
            :label="t('nav.logout')"
            color="negative"
            class="full-width mobile-menu-btn"
            @click="handleLogout"
          />
        </div>
      </div>

      <!-- Guest buttons -->
      <div v-else class="mobile-drawer-buttons">
        <AuthButtons variant="vertical" />
      </div>
    </DrawerMenu>
  </div>
</template>

<style scoped lang="scss">
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

  :deep(.brand-text) {
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

.desktop-auth-buttons {
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

.user-menu {
  display: flex;
  align-items: center;

  @media (max-width: $breakpoint-mobile) {
    display: none;
  }
}

// Drawer content styles
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

.mobile-drawer-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.mobile-menu-btn {
  height: 48px;
  font-size: 16px;
}
</style>
