<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

// Mock data - will be replaced with real data later
const organization = ref({
  id: 1,
  name: 'Coccorico Events',
  avatar: 'https://i.pravatar.cc/300?img=1',
  coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
  bio: 'Legendary nightclub hosting the best electronic music events in Italy since 1989',
  location: 'Riccione, Italy',
  website: 'https://coccorico.it',
  followers: 12547,
  following: 234,
})

const postedEvents = ref([
  {
    id: 1,
    title: 'Techno vibes',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    date: new Date(2024, 11, 8, 23, 0),
    location: 'Coccorico - Riccione',
    status: 'published',
  },
  {
    id: 2,
    title: 'Summer Festival 2024',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    date: new Date(2025, 5, 8, 18, 0),
    location: 'Open Air Stage',
    status: 'published',
  },
])

const draftedEvents = ref([
  {
    id: 3,
    title: 'New Year Special',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    date: new Date(2024, 11, 31, 23, 0),
    location: 'Coccorico - Riccione',
    status: 'draft',
  },
])

const activeTab = ref<'posted' | 'drafted'>('posted')

const displayedEvents = computed(() => {
  return activeTab.value === 'posted' ? postedEvents.value : draftedEvents.value
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

const goToCreateEvent = () => {
  // TODO: Navigate to create event page
  console.log('Create event')
}

const goToEvent = (eventId: number) => {
  router.push({ name: 'event', params: { id: eventId } })
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="organization-profile">
    <!-- Cover Image -->
    <div class="cover-image-container">
      <img :src="organization.coverImage" :alt="organization.name" class="cover-image" />
      <div class="cover-overlay"></div>
      <q-btn icon="arrow_back" flat round dense color="white" class="back-button" @click="goBack" />
    </div>

    <!-- Profile Info -->
    <div class="profile-container">
      <div class="profile-header">
        <div class="avatar-section">
          <img :src="organization.avatar" :alt="organization.name" class="profile-avatar" />
        </div>

        <div class="profile-info">
          <div class="profile-name-row">
            <h1 class="profile-name">{{ organization.name }}</h1>
            <div class="profile-actions">
              <q-btn
                flat
                dense
                :label="t('profile.editProfile')"
                icon="edit"
                class="action-btn edit-btn"
                @click="goToEditProfile"
              />
              <q-btn
                unelevated
                color="primary"
                :label="t('profile.createEvent')"
                icon="add"
                class="action-btn create-btn"
                @click="goToCreateEvent"
              />
            </div>
          </div>
          <p v-if="organization.location" class="profile-location">
            <q-icon name="location_on" size="18px" />
            {{ organization.location }}
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-value">{{ organization.followers.toLocaleString() }}</span>
          <span class="stat-label">{{ t('profile.followers') }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ organization.following.toLocaleString() }}</span>
          <span class="stat-label">{{ t('profile.following') }}</span>
        </div>
      </div>

      <!-- Bio -->
      <div v-if="organization.bio" class="bio-section">
        <p class="bio-text">{{ organization.bio }}</p>
      </div>

      <!-- Website -->
      <div v-if="organization.website" class="website-section">
        <q-icon name="language" size="20px" />
        <a
          :href="organization.website"
          target="_blank"
          rel="noopener noreferrer"
          class="website-link"
        >
          {{ organization.website }}
        </a>
      </div>

      <!-- Tabs -->
      <div class="tabs-section">
        <div class="tabs-header">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'posted' }"
            @click="activeTab = 'posted'"
          >
            {{ t('profile.postedEvents') }}
            <span class="tab-count">{{ postedEvents.length }}</span>
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'drafted' }"
            @click="activeTab = 'drafted'"
          >
            {{ t('profile.draftedEvents') }}
            <span class="tab-count">{{ draftedEvents.length }}</span>
          </button>
        </div>

        <!-- Events Grid -->
        <div class="events-grid">
          <div
            v-for="event in displayedEvents"
            :key="event.id"
            class="event-card"
            @click="activeTab === 'posted' ? goToEvent(event.id) : null"
          >
            <div class="event-image-container">
              <img :src="event.imageUrl" :alt="event.title" class="event-image" />
              <div v-if="event.status === 'draft'" class="draft-badge">
                <q-icon name="edit_note" size="16px" />
                {{ t('profile.draft') }}
              </div>
            </div>
            <div class="event-info">
              <h3 class="event-title">{{ event.title }}</h3>
              <div class="event-details">
                <span class="event-date">
                  <q-icon name="event" size="16px" />
                  {{ formatDate(event.date) }}
                </span>
                <span class="event-location">
                  <q-icon name="location_on" size="16px" />
                  {{ event.location }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="displayedEvents.length === 0" class="empty-state">
          <q-icon :name="activeTab === 'posted' ? 'event_busy' : 'edit_note'" size="64px" />
          <p class="empty-text">
            {{
              activeTab === 'posted' ? t('profile.noPostedEvents') : t('profile.noDraftedEvents')
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.organization-profile {
  min-height: 100vh;
  background: var(--q-background);

  @include light-mode {
    background: #f5f5f5;
  }

  @include dark-mode {
    background: #121212;
  }
}

.cover-image-container {
  position: relative;
  width: 100%;
  height: 320px;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 220px;
  }
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.4) 100%);
}

.back-button {
  position: fixed;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: white !important;
  transition: all 0.3s ease;

  :deep(.q-icon) {
    color: white !important;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-6;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 $spacing-4;
  }
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: $spacing-6;
  margin-top: -80px;
  margin-bottom: $spacing-6;
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: $spacing-4;
    margin-top: -60px;
  }
}

.avatar-section {
  flex-shrink: 0;
}

.profile-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 6px solid var(--q-background);
  object-fit: cover;
  box-shadow: $shadow-lg;

  @include light-mode {
    border-color: white;
  }

  @include dark-mode {
    border-color: #1d1d1d;
  }

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    border-width: 4px;
  }
}

.profile-info {
  flex: 1;
  padding-top: $spacing-20;

  @media (max-width: 768px) {
    padding-top: 0;
    width: 100%;
  }
}

.profile-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
  margin-bottom: $spacing-2;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-3;
  }
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}

.profile-location {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  font-size: 1rem;
  opacity: 0.7;
  margin: 0;

  @media (max-width: 768px) {
    justify-content: center;
  }
}

.profile-actions {
  display: flex;
  gap: $spacing-2;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.action-btn {
  font-size: 0.875rem;
  padding: $spacing-2 $spacing-3;

  @media (max-width: 768px) {
    flex: 1;
  }
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

.create-btn {
  // Primary button already has good styling from Quasar
}

.stats-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-8;
  padding: $spacing-6;
  background: var(--q-background);
  border-radius: 16px;
  box-shadow: $shadow-base;
  margin-bottom: $spacing-6;

  @include light-mode {
    background: white;
  }

  @include dark-mode {
    background: #1d1d1d;
  }

  @media (max-width: 768px) {
    gap: $spacing-6;
    padding: $spacing-4;
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: $color-primary;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(0, 0, 0, 0.1);

  @include dark-mode {
    background: rgba(255, 255, 255, 0.1);
  }
}

.bio-section {
  padding: $spacing-4 $spacing-6;
  background: var(--q-background);
  border-radius: 16px;
  box-shadow: $shadow-base;
  margin-bottom: $spacing-4;

  @include light-mode {
    background: white;
  }

  @include dark-mode {
    background: #1d1d1d;
  }
}

.bio-text {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}

.website-section {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  background: var(--q-background);
  border-radius: 12px;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-6;

  @include light-mode {
    background: white;
  }

  @include dark-mode {
    background: #1d1d1d;
  }
}

.website-link {
  color: $color-primary;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
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

.draft-badge {
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
