<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import BackButton from '@/components/buttons/actionButtons/BackButton.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import { api } from '@/api'
import type { User } from '@/api/types/users'
import { useNavigation } from '@/router/utils'

const { t } = useI18n()
const { goToEventDetails, params } = useNavigation()
const authStore = useAuthStore()

const member = ref<User | null>(null)
const isFollowing = ref(false)
const showAuthDialog = ref(false)

// Check if the current user is viewing their own profile
const isOwnProfile = computed(() => {
  return authStore.isAuthenticated && authStore.user?.id === member.value?.id
})

const loadMember = async () => {
  try {
    const memberId = params.id as string
    const response = await api.users.getUserById(memberId)
    member.value = response.user
    // TODO: Load following status from API
    isFollowing.value = false
  } catch (error) {
    console.error('Failed to load member:', error)
    member.value = null
  }
}

const handleFollowToggle = async () => {
  if (!authStore.isAuthenticated) {
    showAuthDialog.value = true
    return
  }

  try {
    // TODO: Implement API call to follow/unfollow
    isFollowing.value = !isFollowing.value

    // Update follower count
    if (member.value) {
      member.value.followers += isFollowing.value ? 1 : -1
    }
  } catch (error) {
    console.error('Failed to toggle follow:', error)
  }
}

onMounted(() => {
  loadMember()
})

// Mock data for tickets
const myTickets = ref([
  {
    id: 1,
    title: 'Techno vibes',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    date: new Date(2024, 11, 8, 23, 0),
    location: 'Coccorico - Riccione',
    ticketNumber: 'TKT-001234',
  },
])

// Mock data for my events (participated/will participate)
const myEvents = ref([
  {
    id: 2,
    title: 'Summer Festival 2024',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    date: new Date(2025, 5, 8, 18, 0),
    location: 'Open Air Stage',
    attended: false,
  },
  {
    id: 3,
    title: 'New Year Special',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    date: new Date(2023, 11, 31, 23, 0),
    location: 'Coccorico - Riccione',
    attended: true,
  },
])

// Default to 'events' if viewing someone else's profile
const activeTab = ref<'tickets' | 'events'>('events')

const displayedItems = computed(() => {
  return activeTab.value === 'tickets' ? myTickets.value : myEvents.value
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const goToEditProfile = () => {
  // TODO: Navigate to edit profile page
  console.log('Edit profile')
}

const goToEvent = (eventId: string) => {
  goToEventDetails(eventId)
}
</script>

<template>
  <div class="member-profile">
    <BackButton class="back-button" />

    <!-- Auth Required Dialog -->
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />

    <!-- Profile Info -->
    <div v-if="member" class="profile-container">
      <div class="profile-header-card">
        <div class="profile-header">
          <div class="avatar-section">
            <img :src="member.avatarUrl" :alt="member.name" class="profile-avatar" />
          </div>

          <div class="profile-info">
            <div class="profile-name-row">
              <h1 class="profile-name">{{ member.name }}</h1>
              <div v-if="isOwnProfile" class="profile-actions desktop-only">
                <q-btn
                  flat
                  :label="t('profile.editProfile')"
                  icon="edit"
                  dense
                  class="action-btn edit-btn"
                  @click="goToEditProfile"
                />
              </div>
              <div v-else class="profile-actions desktop-only">
                <q-btn
                  :flat="isFollowing"
                  :unelevated="!isFollowing"
                  :label="isFollowing ? t('profile.followingAlready') : t('profile.follow')"
                  dense
                  :class="['action-btn', isFollowing ? 'following-btn' : 'follow-btn']"
                  @click="handleFollowToggle"
                />
              </div>
            </div>

            <div v-if="member.followers || member.following" class="stats-inline">
              <div v-if="member.followers" class="stat-inline-item">
                <span class="stat-inline-value">{{ member.followers.toLocaleString() }}</span>
                <span class="stat-inline-label">{{ t('profile.followers') }}</span>
              </div>
              <div v-if="member.followers && member.following" class="stat-divider-inline"></div>
              <div v-if="member.following" class="stat-inline-item">
                <span class="stat-inline-value">{{ member.following.toLocaleString() }}</span>
                <span class="stat-inline-label">{{ t('profile.following') }}</span>
              </div>
            </div>

            <!-- Bio -->
            <p v-if="member.bio" class="profile-bio">{{ member.bio }}</p>

            <!-- Website -->
            <div v-if="member.website" class="profile-website">
              <q-icon name="language" size="18px" />
              <a
                :href="member.website"
                target="_blank"
                rel="noopener noreferrer"
                class="website-link"
              >
                {{ member.website }}
              </a>
            </div>

            <!-- Mobile buttons -->
            <div v-if="isOwnProfile" class="profile-actions mobile-only">
              <q-btn
                flat
                :label="t('profile.editProfile')"
                icon="edit"
                dense
                class="action-btn edit-btn full-width"
                @click="goToEditProfile"
              />
            </div>
            <div v-else class="profile-actions mobile-only">
              <q-btn
                :flat="isFollowing"
                :unelevated="!isFollowing"
                :label="isFollowing ? t('profile.followingAlready') : t('profile.follow')"
                dense
                :class="['action-btn', 'full-width', isFollowing ? 'following-btn' : 'follow-btn']"
                @click="handleFollowToggle"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-section">
        <div class="tabs-header">
          <button
            v-if="isOwnProfile"
            class="tab-button"
            :class="{ active: activeTab === 'tickets' }"
            @click="activeTab = 'tickets'"
          >
            {{ t('profile.myTickets') }}
            <span class="tab-count">{{ myTickets.length }}</span>
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'events' }"
            @click="activeTab = 'events'"
          >
            {{ t('profile.myEvents') }}
            <span class="tab-count">{{ myEvents.length }}</span>
          </button>
        </div>

        <!-- Items Grid -->
        <div class="events-grid">
          <div
            v-for="item in displayedItems"
            :key="item.id"
            class="event-card"
            @click="goToEvent(String(item.id))"
          >
            <div class="event-image-container">
              <img :src="item.imageUrl" :alt="item.title" class="event-image" />
              <div v-if="activeTab === 'tickets' && 'ticketNumber' in item" class="ticket-badge">
                <q-icon name="confirmation_number" size="16px" />
                {{ item.ticketNumber }}
              </div>
            </div>
            <div class="event-info">
              <h3 class="event-title">{{ item.title }}</h3>
              <div class="event-details">
                <span class="event-date">
                  <q-icon name="event" size="16px" />
                  {{ formatDate(item.date) }}
                </span>
                <span class="event-location">
                  <q-icon name="location_on" size="16px" />
                  {{ item.location }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="displayedItems.length === 0" class="empty-state">
          <q-icon :name="activeTab === 'tickets' ? 'confirmation_number' : 'event'" size="64px" />
          <p class="empty-text">
            {{ activeTab === 'tickets' ? t('profile.noTickets') : t('profile.noEvents') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';

.back-button {
  position: fixed;
  left: max($spacing-4, calc((100vw - $app-max-width) / 2 + $spacing-4));
}

.member-profile {
  min-height: 100vh;
  background: var(--q-background);
  position: relative;
  padding-top: calc(#{$spacing-4} + 40px + #{$spacing-4});

  @include light-mode {
    background: #f5f5f5;
  }

  @include dark-mode {
    background: #121212;
  }
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-6 $spacing-8;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 $spacing-4 $spacing-6;
  }
}

.profile-header-card {
  background: var(--q-background);
  border-radius: 16px;
  box-shadow: $shadow-base;
  padding: $spacing-6;
  margin-bottom: $spacing-6;

  @include light-mode {
    background: white;
  }

  @include dark-mode {
    background: #1d1d1d;
  }

  @media (max-width: 768px) {
    padding: $spacing-4;
  }
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: $spacing-6;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-4;
  }
}

.avatar-section {
  flex-shrink: 0;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: $shadow-md;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
}

.profile-info {
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}

.profile-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
  margin-bottom: $spacing-3;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: $spacing-2;
    order: 1;
    margin-bottom: 0;
  }
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
  }
}

.stats-inline {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  margin-bottom: $spacing-4;

  @media (max-width: 768px) {
    justify-content: center;
    order: 2;
    margin-bottom: $spacing-4;
  }
}

.stat-inline-item {
  display: flex;
  align-items: baseline;
  gap: $spacing-1;
}

.stat-inline-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.stat-inline-label {
  font-size: 0.875rem;
  opacity: 0.6;
}

.stat-divider-inline {
  width: 1px;
  height: 16px;
  background: rgba(0, 0, 0, 0.2);

  @include dark-mode {
    background: rgba(255, 255, 255, 0.2);
  }
}

.desktop-only {
  display: flex;

  @media (max-width: 768px) {
    display: none;
  }
}

.mobile-only {
  display: none;

  @media (max-width: 768px) {
    display: flex;
  }
}

.profile-actions {
  display: flex;
  gap: $spacing-2;
  flex-shrink: 0;

  &.mobile-only {
    @media (max-width: 768px) {
      width: 100%;
      order: 5;
      margin-top: $spacing-2;
    }
  }
}

.action-btn {
  font-size: 0.875rem;
  padding: $spacing-2 $spacing-3;
}

.edit-btn {
  border: 1px solid rgba(0, 0, 0, 0.12);

  @include light-mode {
    background: transparent;
    color: $color-text-primary;
    border-color: rgba(0, 0, 0, 0.12);

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  @include dark-mode {
    background: transparent;
    color: $color-text-dark;
    border-color: rgba(255, 255, 255, 0.12);

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.follow-btn {
  background: $color-primary;
  color: white;

  &:hover {
    background: color.adjust($color-primary, $lightness: -8%);
  }
}

.following-btn {
  border: 1px solid rgba(0, 0, 0, 0.12);

  @include light-mode {
    background: transparent;
    color: $color-text-primary;
    border-color: rgba(0, 0, 0, 0.12);

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  @include dark-mode {
    background: transparent;
    color: $color-text-dark;
    border-color: rgba(255, 255, 255, 0.12);

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.profile-bio {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 $spacing-3 0;
  opacity: 0.8;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }

  @media (max-width: 768px) {
    font-size: 0.9375rem;
    order: 3;
  }
}

.profile-website {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  margin: 0;
  opacity: 0.9;

  .q-icon {
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    order: 4;
    margin-bottom: $spacing-3;
  }
}

.website-link {
  color: $color-primary;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
}

.tabs-section {
  background: var(--q-background);
  border-radius: 16px;
  box-shadow: $shadow-base;
  padding: $spacing-6;
  margin-bottom: $spacing-6;

  @include light-mode {
    background: white;
  }

  @include dark-mode {
    background: #1d1d1d;
  }

  @media (max-width: 768px) {
    padding: $spacing-4;
  }
}

.tabs-header {
  display: flex;
  gap: $spacing-2;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  margin-bottom: $spacing-6;

  @include dark-mode {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
}

.tab-button {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
  opacity: 0.6;
  transition: all 0.3s ease;
  margin-bottom: -2px;

  &.active {
    opacity: 1;
    border-bottom-color: $color-primary;
    color: $color-primary;
  }

  &:hover:not(.active) {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
    font-size: 0.875rem;
    padding: $spacing-2 $spacing-3;
  }
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 $spacing-2;
  background: rgba($color-primary, 0.1);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}

.event-card {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;
  }
}

.event-image-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  .event-card:hover & {
    transform: scale(1.05);
  }
}

.ticket-badge {
  position: absolute;
  top: $spacing-3;
  right: $spacing-3;
  display: flex;
  align-items: center;
  gap: $spacing-1;
  padding: $spacing-1 $spacing-2;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  color: white;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.event-info {
  padding: $spacing-4;
}

.event-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 $spacing-3 0;
  line-height: 1.3;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.event-date,
.event-location {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  font-size: 0.875rem;
  opacity: 0.7;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-12 $spacing-6;
  gap: $spacing-4;
}

.empty-text {
  font-size: 1rem;
  opacity: 0.6;
  margin: 0;
}
</style>
