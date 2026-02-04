<script lang="ts">
export const NAVBAR_HEIGHT = 64
export const NAVBAR_HEIGHT_CSS = `${NAVBAR_HEIGHT}px`
</script>

<script setup lang="ts">
import { computed, ref, inject, type Ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { useDarkMode } from '@/composables/useDarkMode'
import { useUnreadMessagesCount } from '@/composables/useUnreadMessagesCount'
import SearchBar from './SearchBar.vue'
import AppBrand from '@/components/common/AppBrand.vue'
import { useNavigation } from '@/router/utils'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
import AuthButtons from '../auth/AuthButtons.vue'
import DrawerMenu from './DrawerMenu.vue'
import NotificationsButton from '@/components/notifications/NotificationsButton.vue'
import { useTranslation } from '@/composables/useTranslation'
const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const searchBarHasFocus = inject<Ref<boolean>>('searchBarHasFocus', ref(false))
interface Props {
  showSearch?: boolean
}

const props = defineProps<Props>()
const $q = useQuasar()
const { t } = useTranslation('components.navigation.NavigationBar')
const authStore = useAuthStore()
const { goToHome, goToUserProfile, goToCreateEvent, goToChat } = useNavigation()
const { unreadMessagesCount } = useUnreadMessagesCount()

const mobileSearchOpen = ref(false)
const mobileMenuOpen = ref(false)

watch(
  () => searchBarHasFocus.value,
  (newVal) => (mobileSearchOpen.value = newVal)
)

const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)
const showMobileSearch = computed(() => {
  return searchBarHasFocus.value && props.showSearch && isMobile.value
})

const toggleMobileSearch = () => {
  if (mobileSearchOpen.value) {
    mobileSearchOpen.value = false
    if (searchQuery) searchQuery.value = ''
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
    mobileMenuOpen.value = false
  }
}
</script>

<template>
  <div class="navbar-wrapper">
    <q-toolbar class="navigation-bar">
      <div v-if="showMobileSearch" class="mobile-search-bar">
        <div class="mobile-search-container">
          <SearchBar />
        </div>
        <q-btn
          flat
          dense
          icon="close"
          :aria-label="t('ariaLabels.closeSearch')"
          @mousedown.prevent="toggleMobileSearch"
        />
      </div>

      <template v-else>
        <template v-if="isMobile">
          <div class="brand-title">
            <AppBrand />
          </div>
          <q-space />
          <template v-if="showSearch">
            <q-btn
              flat
              dense
              icon="search"
              :aria-label="t('ariaLabels.search')"
              @click="toggleMobileSearch"
            />
          </template>
          <template v-if="authStore.isAuthenticated">
            <NotificationsButton dense />
            <q-btn flat dense icon="chat" :aria-label="t('ariaLabels.chat')" @click="goToChat()">
              <q-badge v-if="unreadMessagesCount && unreadMessagesCount > 0" color="red" floating>{{
                String(unreadMessagesCount)
              }}</q-badge>
            </q-btn>
          </template>
          <q-btn
            flat
            dense
            icon="menu"
            :aria-label="t('ariaLabels.menu')"
            @click="toggleMobileMenu"
          />
        </template>
        <template v-else>
          <div class="brand-title">
            <AppBrand />
          </div>
          <q-space />
          <div v-if="showSearch" class="search-wrapper">
            <SearchBar />
          </div>
          <q-space />
          <div class="actions-wrapper">
            <div v-if="authStore.isAuthenticated" class="authenticated-actions">
              <q-btn
                flat
                round
                class="theme-toggle"
                :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
                :aria-label="t('ariaLabels.toggleTheme')"
                @click="useDarkMode().toggle"
              >
              </q-btn>
              <q-btn
                v-if="authStore.isOrganization"
                flat
                round
                icon="add"
                class="create-event-btn"
                :aria-label="t('ariaLabels.createEvent')"
                @click="goToCreateEvent()"
              >
              </q-btn>
              <NotificationsButton />
              <q-btn flat round icon="chat" :aria-label="t('ariaLabels.chat')" @click="goToChat()">
                <q-badge
                  v-if="unreadMessagesCount && unreadMessagesCount > 0"
                  color="red"
                  floating
                  >{{ String(unreadMessagesCount) }}</q-badge
                >
              </q-btn>
              <q-btn flat round>
                <q-avatar size="40px">
                  <img :src="authStore.user!.avatar" :alt="authStore.user!.name" />
                </q-avatar>
                <q-menu>
                  <q-list style="min-width: 200px" class="profile-menu-list">
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
                      <q-item-section>{{ t('logout') }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
            <div v-else class="unauthenticated-actions">
              <q-btn
                flat
                round
                class="theme-toggle"
                :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
                :aria-label="t('ariaLabels.toggleTheme')"
                @click="useDarkMode().toggle"
              >
              </q-btn>
              <AuthButtons />
            </div>
          </div>
        </template>
      </template>
    </q-toolbar>

    <DrawerMenu v-model:is-open="mobileMenuOpen">
      <div v-if="authStore.isAuthenticated">
        <div class="drawer-user-info">
          <q-avatar size="60px">
            <img :src="authStore.user!.avatar" :alt="authStore.user!.name" />
          </q-avatar>
          <div class="drawer-user-details">
            <div class="drawer-user-name">{{ authStore.user!.name }}</div>
            <div class="drawer-user-email">{{ authStore.user!.email }}</div>
          </div>
        </div>
        <q-separator class="q-my-md" />
        <div class="drawer-theme-toggle">
          <div class="toggle-field">
            <div class="toggle-label">
              <q-icon :name="'dark_mode'" size="24px" />
              <span>{{ t('darkMode') }}</span>
            </div>
            <q-toggle
              :model-value="$q.dark.isActive"
              color="primary"
              @update:model-value="useDarkMode().toggle"
            />
          </div>
        </div>
        <q-separator class="q-my-md" />
        <div class="drawer-user-buttons">
          <q-btn
            flat
            icon="person"
            :label="t('profile')"
            class="base-button base-button--secondary"
            @click="goToProfile"
          />
          <q-btn
            v-if="authStore.isOrganization"
            unelevated
            color="primary"
            icon="add"
            :label="t('ariaLabels.createEvent')"
            class="base-button base-button--primary"
            @click="
              () => {
                goToCreateEvent()
                mobileMenuOpen = false
              }
            "
          />
          <q-btn
            flat
            icon="logout"
            :label="t('logout')"
            class="base-button base-button--secondary"
            @click="handleLogout"
          />
        </div>
      </div>
      <div v-else class="drawer-unauthenticated">
        <div class="drawer-theme-toggle">
          <div class="toggle-field">
            <div class="toggle-label">
              <q-icon :name="'dark_mode'" size="24px" />
              <span>{{ t('darkMode') }}</span>
            </div>
            <q-toggle
              :model-value="$q.dark.isActive"
              color="primary"
              @update:model-value="useDarkMode().toggle"
            />
          </div>
        </div>
        <q-separator class="q-my-md" />
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
  display: flex;
  align-items: center;
  gap: $spacing-8;

  @include dark-mode {
    background-color: $color-background-dark;
  }

  @media (max-width: $breakpoint-mobile) {
    padding: 0 $spacing-2;
    gap: $spacing-2;
  }
}

.profile-menu-list {
  :deep(.q-item) {
    @include dark-mode {
      background: $color-background-dark;
      &:hover {
        background: color-alpha($color-background-dark, 0.5);
      }
    }
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
  flex-shrink: 0;
  display: flex;
  align-items: center;

  :deep(.brand-text) {
    @media (max-width: $breakpoint-mobile) {
      display: none;
    }
  }
}

.search-wrapper {
  flex-shrink: 1;
  flex-grow: 0;
  max-width: 600px;
  min-width: 0;
  width: 100%;
}

.actions-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.drawer-user-info {
  @include flex-center;
  gap: $spacing-3;

  :deep(.q-avatar img) {
    object-fit: cover;
  }
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

.authenticated-actions {
  @include flex-center;
  gap: $spacing-2;
  flex-wrap: nowrap;

  :deep(.q-badge) {
    font-weight: $font-weight-semibold;
  }

  :deep(.q-avatar img) {
    object-fit: cover;
  }
}

.unauthenticated-actions {
  @include flex-center;
  gap: $spacing-1;
  flex-wrap: nowrap;
}

.create-event-btn,
.notifications-btn,
.chat-btn {
  transition: all $transition-base;

  :deep(.q-icon) {
    transition: transform 0.3s ease;
  }

  &:hover :deep(.q-icon) {
    transform: scale(1.1);
  }
}

.create-event-btn {
  &:hover :deep(.q-icon) {
    transform: rotate(90deg);
  }
}

.theme-toggle {
  transition: all $transition-base;

  :deep(.q-icon) {
    transition: transform 0.3s ease;
  }

  &:hover :deep(.q-icon) {
    transform: rotate(20deg);
  }
}

.drawer-theme-toggle {
  padding: $spacing-2 0;
}

.toggle-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-2 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-white;
  }

  .q-icon {
    color: $color-gray-600;
    transition: transform 0.3s ease;

    @include dark-mode {
      color: $color-gray-400;
    }
  }
}
</style>
