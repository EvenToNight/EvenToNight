<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import BackButton from '@/components/BackButton.vue'
import { api } from '@/api'
import type { User } from '@/api/types/users'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const organization = ref<User | null>(null)

const loadOrganization = async () => {
  try {
    const organizationId = route.params.id as string
    const response = await api.users.getUserById({ userId: organizationId })
    organization.value = response.user
  } catch (error) {
    console.error('Failed to load organization:', error)
    organization.value = null
  }
}

onMounted(() => {
  loadOrganization()
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
  router.push({ name: 'create-event' })
}

const goToEvent = (eventId: number) => {
  router.push({ name: 'event', params: { id: eventId } })
}
</script>

<template>
  <div class="organization-profile">
    <BackButton />

    <!-- Profile Info -->
    <div v-if="organization" class="profile-container">
      <div class="profile-header-card">
        <div class="profile-header">
          <div class="avatar-section">
            <img :src="organization.avatarUrl" :alt="organization.name" class="profile-avatar" />
          </div>

          <div class="profile-info">
            <div class="profile-name-row">
              <h1 class="profile-name">{{ organization.name }}</h1>
              <div class="profile-actions desktop-only">
                <q-btn
                  flat
                  :label="t('profile.editProfile')"
                  icon="edit"
                  dense
                  class="action-btn edit-btn"
                  @click="goToEditProfile"
                />
                <q-btn
                  unelevated
                  color="primary"
                  :label="t('profile.createEvent')"
                  icon="add"
                  dense
                  class="action-btn create-btn"
                  @click="goToCreateEvent"
                />
              </div>
            </div>

            <div v-if="organization.followers || organization.following" class="stats-inline">
              <div v-if="organization.followers" class="stat-inline-item">
                <span class="stat-inline-value">{{ organization.followers.toLocaleString() }}</span>
                <span class="stat-inline-label">{{ t('profile.followers') }}</span>
              </div>
              <div
                v-if="organization.followers && organization.following"
                class="stat-divider-inline"
              ></div>
              <div v-if="organization.following" class="stat-inline-item">
                <span class="stat-inline-value">{{ organization.following.toLocaleString() }}</span>
                <span class="stat-inline-label">{{ t('profile.following') }}</span>
              </div>
            </div>

            <!-- Bio -->
            <p v-if="organization.bio" class="profile-bio">{{ organization.bio }}</p>

            <!-- Website -->
            <div v-if="organization.website" class="profile-website">
              <q-icon name="language" size="18px" />
              <a
                :href="organization.website"
                target="_blank"
                rel="noopener noreferrer"
                class="website-link"
              >
                {{ organization.website }}
              </a>
            </div>

            <!-- Mobile buttons -->
            <div class="profile-actions mobile-only">
              <q-btn
                flat
                :label="t('profile.editProfile')"
                icon="edit"
                dense
                class="action-btn edit-btn"
                @click="goToEditProfile"
              />
              <q-btn
                unelevated
                color="primary"
                :label="t('profile.createEvent')"
                icon="add"
                dense
                class="action-btn create-btn"
                @click="goToCreateEvent"
              />
            </div>
          </div>
        </div>
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
