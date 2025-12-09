<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import EventDetailsHeader from '@/components/eventDetails/EventDetailsHeader.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import type { User } from '@/api/types/users'
import { useNavigation } from '@/router/utils'

const { params, goToHome, goToUserProfile, locale } = useNavigation()
const { t } = useI18n()
const authStore = useAuthStore()

const eventId = computed(() => params.id as string)
const showAuthDialog = ref(false)

const event = ref<Event | null>(null)
const organizer = ref<User | null>(null)
const collaborators = ref<User[]>([])

const loadOrganizer = async (userId: string) => {
  try {
    const response = await api.users.getUserById(userId)
    organizer.value = response.user
  } catch (error) {
    console.error('Failed to load organizer:', error)
    organizer.value = null
  }
}

const loadCollaborators = async (userIds: string[]) => {
  try {
    const promises = userIds.map((userId) => api.users.getUserById(userId))
    const responses = await Promise.all(promises)
    collaborators.value = responses.map((response) => response.user)
  } catch (error) {
    console.error('Failed to load collaborators:', error)
    collaborators.value = []
  }
}

const loadEvent = async () => {
  try {
    const response = await api.events.getEventById(eventId.value)
    event.value = response.event
    const promises = []
    if (event.value.creatorId) {
      promises.push(loadOrganizer(event.value.creatorId))
    }
    if (event.value.collaboratorsId?.length) {
      promises.push(loadCollaborators(event.value.collaboratorsId))
    }
    await Promise.all(promises)
  } catch (error) {
    console.error('Failed to load event:', error)
    event.value = null
    goToHome()
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const isFavorite = ref(false)
const likesCount = ref(0)

const loadInteractions = async () => {
  try {
    const interaction = await api.interactions.getEventInteractions(eventId.value!)
    likesCount.value = interaction.likes.length
    if (authStore.user?.id) {
      isFavorite.value = interaction.likes.includes(authStore.user.id)
    }
  } catch (error) {
    console.error('Failed to load interactions:', error)
    likesCount.value = 0
    isFavorite.value = false
  }
}

const toggleLike = async () => {
  if (!authStore.isAuthenticated) {
    showAuthDialog.value = true
    return
  }
  const wasLiked = isFavorite.value

  // Optimistic update
  isFavorite.value = !isFavorite.value
  likesCount.value += isFavorite.value ? 1 : -1

  try {
    if (!wasLiked) {
      await api.interactions.likeEvent(eventId.value, authStore.user!.id)
    } else {
      await api.interactions.unlikeEvent(eventId.value, authStore.user!.id)
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
    isFavorite.value = wasLiked
    likesCount.value += wasLiked ? 1 : -1
  }
}

const locationAddress = computed(() => {
  const loc = event.value!.location
  return [loc.name, loc.road, loc.house_number, loc.city, loc.province, loc.country]
    .filter(Boolean)
    .join(', ')
})

onMounted(async () => {
  await loadEvent()
  await loadInteractions()
})
</script>

<template>
  <div v-if="event" class="event-details-view">
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <EventDetailsHeader :posterLink="event.posterLink" :title="event.title" />

    <div class="content-wrapper">
      <div class="info-box">
        <div class="title-row">
          <div class="title-content">
            <h1 class="event-title">{{ event.title }}</h1>
            <p class="event-subtitle">{{ event.location.name || event.location.city }}</p>
          </div>
          <button class="like-button" :class="{ liked: isFavorite }" @click="toggleLike">
            <q-icon :name="isFavorite ? 'favorite' : 'favorite_border'" size="24px" />
            <span class="like-count">{{ likesCount }}</span>
          </button>
        </div>

        <div v-if="event.tags && event.tags.length" class="tags-container">
          <span v-for="tag in event.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="info-list">
          <div class="info-item">
            <q-icon name="event" class="info-icon" />
            <div class="info-text">
              <span class="info-label">{{ t('eventDetails.date') }}</span>
              <span class="info-value">{{ formatDate(event.date) }}</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="schedule" class="info-icon" />
            <div class="info-text">
              <span class="info-label">{{ t('eventDetails.time') }}</span>
              <span class="info-value">{{ formatTime(event.date) }}</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="location_on" class="info-icon" />
            <div class="info-text">
              <span class="info-label">{{ t('eventDetails.location') }}</span>
              <span class="info-value">{{ locationAddress }}</span>
            </div>
            <a
              :href="event.location.link"
              target="_blank"
              rel="noopener noreferrer"
              class="maps-link"
              title="Open in Google Maps"
            >
              <q-icon name="open_in_new" size="20px" />
            </a>
          </div>

          <div class="info-item">
            <q-icon name="confirmation_number" class="info-icon" />
            <div class="info-text">
              <span class="info-label">{{ t('eventDetails.price') }}</span>
              <span class="info-value">€{{ event.price }}</span>
            </div>
          </div>
        </div>

        <div class="description-section">
          <h2 class="section-title">{{ t('eventDetails.about') }}</h2>
          <p class="event-description">{{ event.description }}</p>
        </div>

        <div v-if="organizer" class="organizer-section">
          <h3 class="section-subtitle">{{ t('eventDetails.organizer') }}</h3>
          <div class="organizer-card" @click="goToUserProfile(event.creatorId)">
            <img
              v-if="organizer.avatarUrl"
              :src="organizer.avatarUrl"
              :alt="organizer.name"
              class="organizer-avatar"
            />
            <div class="organizer-info">
              <h4 class="organizer-name">{{ organizer.name }}</h4>
              <p v-if="organizer.bio" class="organizer-description">
                {{ organizer.bio }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="collaborators.length > 0" class="collaborators-section">
          <h3 class="section-subtitle">{{ t('eventDetails.collaborators') }}</h3>
          <div class="collaborators-list">
            <div
              v-for="collab in collaborators"
              :key="collab.id"
              class="collaborator-card"
              @click="goToUserProfile(collab.id)"
            >
              <img
                v-if="collab.avatarUrl"
                :src="collab.avatarUrl"
                :alt="collab.name"
                class="collaborator-avatar"
              />
              <span class="collaborator-name">{{ collab.name }}</span>
            </div>
          </div>
        </div>

        <q-btn
          unelevated
          color="primary"
          :label="t('eventDetails.buyTickets')"
          size="lg"
          class="buy-button"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.event-details-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--q-background);

  @include light-mode {
    background: #f5f5f5;
  }

  @include dark-mode {
    background: #121212;
  }
}

.content-wrapper {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 0 $spacing-4 $spacing-8;
  box-sizing: border-box;

  @media (max-width: 330px) {
    padding: 0 $spacing-2 $spacing-6;
  }
}

.info-box {
  background: var(--q-background);
  border-radius: 24px;
  padding: $spacing-8;
  margin-top: -$spacing-12;
  position: relative;
  z-index: 5;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  @include light-mode {
    background: white;
  }

  @include dark-mode {
    background: #1d1d1d;
  }

  @media (max-width: 768px) {
    padding: $spacing-6;
    margin-top: -$spacing-8;
    border-radius: 20px;
  }
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $spacing-4;
  margin-bottom: $spacing-4;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: $spacing-3;
  }
}

.title-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 $spacing-2 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.event-subtitle {
  font-size: 1.25rem;
  color: $color-primary;
  margin: 0;
  font-weight: 500;
}

.like-button {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-3 $spacing-4;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;

  @include light-mode {
    border-color: rgba(0, 0, 0, 0.1);
    color: $color-text-primary;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &.liked {
      background: rgba($color-primary, 0.1);
      border-color: $color-primary;
      color: $color-primary;

      .q-icon {
        color: $color-primary;
      }
    }
  }

  @include dark-mode {
    border-color: rgba(255, 255, 255, 0.15);
    color: $color-text-dark;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    &.liked {
      background: rgba($color-primary, 0.15);
      border-color: $color-primary;
      color: $color-primary;

      .q-icon {
        color: $color-primary;
      }
    }
  }

  @media (max-width: 768px) {
    padding: $spacing-2 $spacing-3;
    align-self: flex-start;
  }
}

.like-count {
  font-size: 1rem;
  font-weight: 600;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-bottom: $spacing-6;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: $spacing-2 $spacing-3;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  background: $color-primary;
  color: white;
  cursor: default;

  @media (max-width: 768px) {
    font-size: 0.813rem;
    padding: $spacing-1 $spacing-2;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
  padding: $spacing-4 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.1);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    gap: $spacing-3;
    padding: $spacing-3 0;
  }
}

.info-item {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: 0;

  @media (max-width: 768px) {
    gap: $spacing-2;
  }
}

.info-icon {
  color: $color-primary;
  font-size: 24px;
  flex-shrink: 0;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 22px;
  }
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 0.75rem;
  opacity: 0.6;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.938rem;
  font-weight: 600;
  word-wrap: break-word;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
}

.description-section {
  margin-bottom: $spacing-8;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 $spacing-4 0;
}

.event-description {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}

.organizer-section {
  margin-bottom: $spacing-6;
}

.section-subtitle {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 $spacing-4 0;
  opacity: 0.7;
}

.organizer-card {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-4;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
    background: rgba(0, 0, 0, 0.04);

    @include dark-mode {
      background: rgba(255, 255, 255, 0.08);
    }
  }

  @media (max-width: 768px) {
    padding: $spacing-3;
    gap: $spacing-3;
  }
}

.organizer-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid $color-primary;

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;
  }
}

.organizer-info {
  flex: 1;
  min-width: 0;
}

.organizer-name {
  font-size: 1.125rem;
  margin: 0 0 $spacing-1 0;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

.organizer-description {
  font-size: 0.938rem;
  margin: 0;
  opacity: 0.7;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
}

.collaborators-section {
  margin-bottom: $spacing-8;
}

.collaborators-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-3;
}

.collaborator-card {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  cursor: default;

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    @include dark-mode {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  @media (max-width: 768px) {
    padding: $spacing-2;
  }
}

.collaborator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba($color-primary, 0.5);

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
}

.collaborator-name {
  font-size: 0.938rem;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
}

.buy-button {
  width: 100%;
  height: 56px;
  font-size: 1.125rem;
  font-weight: 600;
}

.maps-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-2;
  border-radius: 8px;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  transition: all 0.2s ease;
  text-decoration: none;
  flex-shrink: 0;

  &:hover {
    background: rgba($color-primary, 0.2);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  .q-icon {
    color: $color-primary;
  }

  @media (max-width: 768px) {
    padding: $spacing-1;
  }
}
</style>
