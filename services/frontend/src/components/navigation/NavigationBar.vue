<script lang="ts">
export const NAVBAR_HEIGHT = 64
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SearchBar from './SearchBar.vue'
import type { SearchResult } from '@/api/utils'
import AppBrand from '@/components/common/AppBrand.vue'
import { useNavigation } from '@/router/utils'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
import AuthButtons from '../auth/AuthButtons.vue'
import DrawerMenu from './DrawerMenu.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)

interface Props {
  showSearch?: boolean
  searchQuery?: string
  searchResults?: SearchResult[]
  hasFocus?: boolean
}

const props = defineProps<Props>()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()
const { goToHome, goToUserProfile } = useNavigation()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:searchResults': [value: SearchResult[]]
  'update:hasFocus': [value: boolean]
}>()

const mobileSearchOpen = ref(false) //TODO evaluate usage
const mobileMenuOpen = ref(false)

const searchQuery = computed({
  get: () => props.searchQuery ?? '',
  set: (value) => emit('update:searchQuery', value),
})

const searchResults = computed({
  get: () => props.searchResults ?? [],
  set: (value) => emit('update:searchResults', value),
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
  mobileMenuOpen.value = false
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
      <div v-if="showMobileSearch" class="mobile-search-bar">
        <div class="mobile-search-container">
          <SearchBar
            v-model:search-query="searchQuery"
            v-model:search-results="searchResults"
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
        <template v-if="isMobile">
          <template v-if="showSearch">
            <q-btn flat dense icon="search" @click="toggleMobileSearch" />
          </template>
          <q-btn flat dense icon="menu" @click="toggleMobileMenu" />
        </template>
        <template v-else>
          <div v-if="showSearch" class="search-container">
            <SearchBar
              v-model:search-query="searchQuery"
              v-model:search-results="searchResults"
              v-model:has-focus="searchBarHasFocus"
              :autofocus="hasFocus"
            />
          </div>
          <div v-if="authStore.isAuthenticated">
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
                    <q-item-section>{{ t('profile') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable @click="handleLogout">
                    <q-item-section avatar>
                      <q-icon name="logout" />
                    </q-item-section>
                    <q-item-section>{{ t('auth.logout') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
          <div v-else>
            <AuthButtons />
          </div>
        </template>
      </template>
    </q-toolbar>

    <DrawerMenu v-model:is-open="mobileMenuOpen">
      <div v-if="authStore.isAuthenticated">
        <div class="drawer-user-info">
          <q-avatar size="60px">
            <img
              :src="authStore.user?.avatarUrl || '/default-avatar.png'"
              :alt="authStore.user?.name"
            />
          </q-avatar>
          <div class="drawer-user-details">
            <div class="drawer-user-name">{{ authStore.user?.name }}</div>
            <div class="drawer-user-email">{{ authStore.user?.email }}</div>
          </div>
        </div>
        <q-separator class="q-my-md" />
        <div class="drawer-user-buttons">
          <Button icon="person" :label="t('profile')" variant="secondary" @click="goToProfile" />
          <Button
            icon="logout"
            :label="t('auth.logout')"
            variant="secondary"
            @click="handleLogout"
          />
        </div>
      </div>
      <div v-else>
        <AuthButtons variant="vertical" />
      </div>
    </DrawerMenu>
  </div>
</template>

<style scoped lang="scss">
.navbar-wrapper {
  min-width: $app-min-width;
  width: 100%;

  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
}

.navigation-bar {
  min-width: $app-min-width;
  width: 100%;
  min-height: 64px;
  transition: background-color $transition-base;
  position: relative;
  background-color: $color-white;

  @include dark-mode {
    background-color: $color-background-dark;
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
}

.drawer-user-info {
  @include flex-center;
  gap: $spacing-3;
}

.drawer-user-details {
  flex: 1;
  min-width: 0;
}

.drawer-user-name {
  @include text-truncate;
  font-weight: $font-weight-semibold;
  font-size: $font-size-base;
  color: $color-text-primary;
  @include dark-mode {
    color: $color-white;
  }
}

.drawer-user-email {
  @include text-truncate;
  font-size: $font-size-sm;
  margin-top: $spacing-1;
  color: $color-gray-500;
  @include dark-mode {
    color: $color-gray-200;
  }
}

.drawer-user-buttons {
  @include flex-column;
  gap: $spacing-3;
}
</style>
