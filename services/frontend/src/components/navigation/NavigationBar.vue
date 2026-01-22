<script lang="ts">
export const NAVBAR_HEIGHT = 64
export const NAVBAR_HEIGHT_CSS = `${NAVBAR_HEIGHT}px`
</script>

<script setup lang="ts">
import { computed, ref, inject, type Ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SearchBar from './SearchBar.vue'
import AppBrand from '@/components/common/AppBrand.vue'
import { useNavigation } from '@/router/utils'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
import AuthButtons from '../auth/AuthButtons.vue'
import DrawerMenu from './DrawerMenu.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)

const searchQuery = inject<Ref<string>>('searchQuery')
const searchBarHasFocus = inject<Ref<boolean>>('searchBarHasFocus', ref(false))
interface Props {
  showSearch?: boolean
}

interface Notification {
  id: string
  icon: string
  iconColor: string
  message: string
  timestamp: string
}

const props = defineProps<Props>()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()
const { goToHome, goToUserProfile, goToCreateEvent, goToChat } = useNavigation()

const isOrganization = computed(() => authStore.user?.role === 'organization')

// Notifications management
const notifications = ref<Notification[]>([
  {
    id: '1',
    icon: 'event',
    iconColor: 'primary',
    message: 'New event near you',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    icon: 'person_add',
    iconColor: 'primary',
    message: 'New follower',
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    icon: 'chat',
    iconColor: 'primary',
    message: 'New message',
    timestamp: '1 day ago',
  },
])
const notificationsPage = ref(1)
const hasMoreNotifications = ref(true)
const loadingNotifications = ref(false)

const loadMoreNotifications = async (index: number, done: (stop?: boolean) => void) => {
  if (loadingNotifications.value || !hasMoreNotifications.value) {
    done(true)
    return
  }

  loadingNotifications.value = true

  // Simula chiamata API
  setTimeout(() => {
    const newNotifications: Notification[] = []
    const startId = notifications.value.length + 1

    for (let i = 0; i < 5; i++) {
      const id = startId + i
      newNotifications.push({
        id: String(id),
        icon: ['event', 'person_add', 'chat', 'favorite', 'info'][i % 5]!,
        iconColor: 'primary',
        message: `Notification ${id}`,
        timestamp: `${id} days ago`,
      })
    }

    notifications.value.push(...newNotifications)
    notificationsPage.value++

    // Simula fine delle notifiche dopo 20 item
    if (notifications.value.length >= 20) {
      hasMoreNotifications.value = false
      done(true)
    } else {
      done()
    }

    loadingNotifications.value = false
  }, 1000)
}

const mobileSearchOpen = ref(false) //TODO evaluate usage
const mobileMenuOpen = ref(false)

const toggleDarkMode = () => {
  $q.dark.toggle()
  localStorage.setItem('darkMode', String($q.dark.isActive))
}

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
          <template v-if="authStore.isAuthenticated">
            <!-- Notifications Button Mobile -->
            <q-btn flat dense icon="notifications">
              <q-badge color="red" floating>{{ String(notifications.length) }}</q-badge>
              <q-tooltip>Notifications</q-tooltip>
              <q-menu class="notifications-menu">
                <q-list style="min-width: 300px; max-width: 400px" class="notifications-list">
                  <q-item-label header>Notifications</q-item-label>
                  <q-separator />
                  <q-scroll-area
                    class="notifications-scroll-area"
                    :thumb-style="{ width: '4px', borderRadius: '2px', opacity: '0.5' }"
                  >
                    <q-infinite-scroll :offset="50" @load="loadMoreNotifications">
                      <template
                        v-for="(notification, index) in notifications"
                        :key="notification.id"
                      >
                        <q-item clickable>
                          <q-item-section avatar>
                            <q-icon :name="notification.icon" :color="notification.iconColor" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ notification.message }}</q-item-label>
                            <q-item-label caption>{{ notification.timestamp }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-separator v-if="index < notifications.length - 1" />
                      </template>
                      <template #loading>
                        <div class="row justify-center q-my-md">
                          <q-spinner-dots color="primary" size="40px" />
                        </div>
                      </template>
                    </q-infinite-scroll>
                  </q-scroll-area>
                </q-list>
              </q-menu>
            </q-btn>

            <!-- Chat Button Mobile -->
            <q-btn flat dense icon="chat_bubble" @click="goToChat()">
              <q-badge color="red" floating>{{ String(2) }}</q-badge>
              <q-tooltip>Chat</q-tooltip>
            </q-btn>
          </template>
          <q-btn flat dense icon="menu" @click="toggleMobileMenu" />
        </template>
        <template v-else>
          <div
            v-if="showSearch"
            class="search-container"
            :class="{ 'search-container--narrow': !authStore.isAuthenticated }"
          >
            <SearchBar />
          </div>
          <div
            v-if="authStore.isAuthenticated"
            class="authenticated-actions authenticated-actions--left-space"
          >
            <!-- Create Event Button (Organizations only) -->
            <q-btn
              v-if="isOrganization"
              flat
              round
              icon="add"
              class="create-event-btn"
              @click="goToCreateEvent()"
            >
              <q-tooltip>Create Event</q-tooltip>
            </q-btn>

            <!-- Notifications Button -->
            <q-btn flat round icon="notifications">
              <q-badge color="red" floating>{{ String(notifications.length) }}</q-badge>
              <q-tooltip>Notifications</q-tooltip>
              <q-menu class="notifications-menu">
                <q-list style="min-width: 300px; max-width: 400px" class="notifications-list">
                  <q-item-label header>Notifications</q-item-label>
                  <q-separator />
                  <q-scroll-area
                    class="notifications-scroll-area"
                    :thumb-style="{ width: '4px', borderRadius: '2px', opacity: '0.5' }"
                  >
                    <q-infinite-scroll :offset="50" @load="loadMoreNotifications">
                      <template
                        v-for="(notification, index) in notifications"
                        :key="notification.id"
                      >
                        <q-item clickable>
                          <q-item-section avatar>
                            <q-icon :name="notification.icon" :color="notification.iconColor" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ notification.message }}</q-item-label>
                            <q-item-label caption>{{ notification.timestamp }}</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-separator v-if="index < notifications.length - 1" />
                      </template>
                      <template #loading>
                        <div class="row justify-center q-my-md">
                          <q-spinner-dots color="primary" size="40px" />
                        </div>
                      </template>
                    </q-infinite-scroll>
                  </q-scroll-area>
                </q-list>
              </q-menu>
            </q-btn>

            <!-- Chat Button -->
            <q-btn flat round icon="chat_bubble" @click="goToChat()">
              <q-badge color="red" floating>{{ String(2) }}</q-badge>
              <q-tooltip>Chat</q-tooltip>
            </q-btn>

            <!-- User Profile Avatar -->
            <q-btn flat round>
              <q-avatar size="40px">
                <img
                  :src="authStore.user?.avatar || '/default-avatar.png'"
                  :alt="authStore.user?.name"
                />
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
                    <q-item-section>{{ t('auth.logout') }}</q-item-section>
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
              @click="toggleDarkMode"
            >
              <q-tooltip>{{ $q.dark.isActive ? 'Light Mode' : 'Dark Mode' }}</q-tooltip>
            </q-btn>
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
              :src="authStore.user?.avatar || '/default-avatar.png'"
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
            v-if="isOrganization"
            icon="add"
            label="Create Event"
            variant="primary"
            @click="
              () => {
                goToCreateEvent()
                mobileMenuOpen = false
              }
            "
          />
          <Button
            icon="logout"
            :label="t('auth.logout')"
            variant="secondary"
            @click="handleLogout"
          />
        </div>
      </div>
      <div v-else class="drawer-unauthenticated">
        <div class="drawer-theme-toggle">
          <div class="toggle-field">
            <div class="toggle-label">
              <q-icon :name="$q.dark.isActive ? 'light_mode' : 'dark_mode'" size="24px" />
              <span>{{ $q.dark.isActive ? 'Light Mode' : 'Dark Mode' }}</span>
            </div>
            <q-toggle
              :model-value="$q.dark.isActive"
              color="primary"
              @update:model-value="toggleDarkMode"
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

  @include dark-mode {
    background-color: $color-background-dark;
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
  width: clamp(100px, 36vw, 600px);

  &--narrow {
    width: clamp(100px, 22vw, 220px);
  }
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

.authenticated-actions {
  @include flex-center;
  gap: $spacing-4;

  :deep(.q-badge) {
    font-weight: $font-weight-semibold;
  }
}

.authenticated-actions--left-space {
  margin-left: $spacing-4;
}

.unauthenticated-actions {
  @include flex-center;
  gap: $spacing-1;
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

.notifications-btn,
.chat-btn {
  position: relative;

  :deep(.q-badge) {
    font-size: 10px;
    min-width: 18px;
    height: 18px;
    padding: 2px 4px;
    font-weight: $font-weight-semibold;
  }
}

.notifications-list,
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

.notifications-scroll-area {
  height: 400px;
  max-height: 60vh;
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

.drawer-unauthenticated {
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
}
</style>
