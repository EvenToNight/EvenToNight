<script lang="ts">
export const NAVBAR_HEIGHT = 64
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import SearchBar from './SearchBar.vue'

interface Props {
  showSearch?: boolean
  searchQuery?: string
  hasFocus?: boolean
}

const props = defineProps<Props>()

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

const showMobileSearch = computed(() => {
  return searchBarHasFocus.value && props.showSearch
})

const updateSearchQuery = (value: string) => {
  emit('update:searchQuery', value)
}

const handleSignIn = () => {
  console.log('Sign In clicked')
  // TODO: Implement sign in logic
}

const handleSignUp = () => {
  console.log('Sign Up clicked')
  // TODO: Implement sign up logic
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
          <router-link to="/" class="brand-link"> EvenToNight </router-link>
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

        <div class="auth-buttons">
          <q-btn
            flat
            label="Sign In"
            class="q-mr-sm sign-in-btn"
            color="primary"
            @click="handleSignIn"
          />
          <q-btn
            unelevated
            label="Sign Up"
            color="primary"
            class="sign-up-btn"
            @click="handleSignUp"
          />
        </div>

        <!-- Hamburger menu icon (mobile only) -->
        <q-btn flat dense icon="menu" class="hamburger-menu-mobile" @click="toggleMobileMenu" />
      </template>
    </q-toolbar>

    <!-- Mobile menu drawer -->
    <Transition name="drawer">
      <div v-if="mobileMenuOpen" class="mobile-drawer-overlay" @click="closeMobileMenu">
        <div class="mobile-drawer" @click.stop>
          <div class="mobile-drawer-header">
            <q-btn flat dense icon="close" @click="closeMobileMenu" />
          </div>
          <div class="mobile-drawer-content">
            <div class="mobile-drawer-buttons">
              <q-btn
                flat
                label="Sign In"
                color="primary"
                class="full-width mobile-menu-btn"
                @click="handleSignInAndClose"
              />
              <q-btn
                unelevated
                label="Sign Up"
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
  position: sticky;
  top: 0;
  z-index: $z-index-sticky;
  min-width: 300px;
  width: 100%;
}

.navigation-bar {
  min-width: 300px;
  width: 100%;
  min-height: 64px;
  transition: background-color 0.3s ease;

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
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;

  &:hover {
    opacity: 0.8;
  }
}

.search-container {
  flex: 1 1 auto;
  max-width: 500px;
  min-width: 0;
  margin: 0 $spacing-2;
  position: relative;

  @media (max-width: 800px) {
    display: none;
  }
}

.search-icon-mobile {
  display: none;

  @media (max-width: 800px) {
    display: inline-flex;
  }
}

.desktop-space {
  @media (max-width: 800px) {
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

  @media (max-width: 800px) {
    display: none;
  }
}

.hamburger-menu-mobile {
  display: none;

  @media (max-width: 800px) {
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
}

.mobile-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.mobile-drawer {
  width: 300px;
  max-width: 80vw;
  height: 100%;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;

  @include dark-mode {
    background: #1d1d1d;
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
</style>
