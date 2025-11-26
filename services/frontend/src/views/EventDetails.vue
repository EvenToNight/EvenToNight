<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Footer from '@/components/Footer.vue'
import { getEventById } from '@/data/mockEvents'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Get event ID from route params
const eventId = computed(() => route.params.id as string)

// Get event data based on ID
const event = computed(() => getEventById(eventId.value))

// Redirect to home if event not found
watchEffect(() => {
  if (eventId.value && !event.value) {
    router.push({ name: 'home' })
  }
})

const goBack = () => {
  router.back()
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(t('locale'), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat(t('locale'), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<template>
  <div v-if="event" class="event-details-view">
    <!-- Hero Image with Back Button -->
    <div class="hero-image-container">
      <img :src="event.imageUrl" :alt="event.title" class="hero-image" />
      <q-btn icon="arrow_back" flat round dense color="white" class="back-button" @click="goBack" />
      <div class="hero-overlay"></div>
    </div>

    <!-- Event Info Box -->
    <div class="content-wrapper">
      <div class="info-box">
        <h1 class="event-title">{{ event.title }}</h1>
        <p class="event-subtitle">{{ event.subtitle }}</p>

        <div class="info-grid">
          <div class="info-item">
            <q-icon name="event" size="24px" class="info-icon" />
            <div class="info-content">
              <span class="info-label">{{ t('eventDetails.date') }}</span>
              <span class="info-value">{{ formatDate(event.date) }}</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="schedule" size="24px" class="info-icon" />
            <div class="info-content">
              <span class="info-label">{{ t('eventDetails.time') }}</span>
              <span class="info-value">{{ formatTime(event.date) }}</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="location_on" size="24px" class="info-icon" />
            <div class="info-content">
              <span class="info-label">{{ t('eventDetails.location') }}</span>
              <span class="info-value">{{ event.location }}</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="confirmation_number" size="24px" class="info-icon" />
            <div class="info-content">
              <span class="info-label">{{ t('eventDetails.price') }}</span>
              <span class="info-value">{{ event.price }}</span>
            </div>
          </div>
        </div>

        <div class="description-section">
          <h2 class="section-title">{{ t('eventDetails.about') }}</h2>
          <p class="event-description">{{ event.description }}</p>
        </div>

        <div class="organizer-section">
          <h3 class="section-subtitle">{{ t('eventDetails.organizer') }}</h3>
          <p class="organizer-name">{{ event.organizer }}</p>
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

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.event-details-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.hero-image-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 300px;
  }
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1));
  pointer-events: none;
}

.back-button {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: white !important;

  :deep(.q-icon) {
    color: white !important;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
}

.content-wrapper {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 0 $spacing-4;
  box-sizing: border-box;

  @media (max-width: 330px) {
    padding: 0 $spacing-2;
  }
}

.info-box {
  background: var(--q-background);
  border-radius: 16px;
  padding: $spacing-8;
  margin-top: -$spacing-12;
  position: relative;
  z-index: 5;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  @include light-mode {
    background: white;
  }

  @include dark-mode {
    background: #1d1d1d;
  }

  @media (max-width: 768px) {
    padding: $spacing-6;
    margin-top: -$spacing-8;
  }
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
  margin: 0 0 $spacing-6 0;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-4;
  margin-bottom: $spacing-8;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
  padding: $spacing-4;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }
}

.info-icon {
  color: $color-primary;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
  min-width: 0;
}

.info-label {
  font-size: 0.875rem;
  opacity: 0.7;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  word-wrap: break-word;
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
  margin-bottom: $spacing-8;
}

.section-subtitle {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 $spacing-2 0;
  opacity: 0.7;
}

.organizer-name {
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.buy-button {
  width: 100%;
  height: 56px;
  font-size: 1.125rem;
  font-weight: 600;
}
</style>
