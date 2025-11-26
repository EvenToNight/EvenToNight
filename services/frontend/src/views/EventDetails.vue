<script setup lang="ts">
import { computed, watchEffect, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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

// Parallax effect
const heroImageRef = ref<HTMLDivElement | null>(null)
let ticking = false

const updateParallax = () => {
  if (!heroImageRef.value) return

  const scrolled = window.scrollY
  const parallaxSpeed = 0.5
  const opacity = Math.max(1 - scrolled / 500, 0)

  heroImageRef.value.style.transform = `translateY(${scrolled * parallaxSpeed}px)`
  heroImageRef.value.style.opacity = opacity.toString()

  ticking = false
}

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(updateParallax)
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div v-if="event" class="event-details-view">
    <!-- Hero Image with Back Button -->
    <div class="hero-image-container">
      <div ref="heroImageRef" class="hero-image-wrapper">
        <img :src="event.imageUrl" :alt="event.title" class="hero-image" />
      </div>
      <q-btn icon="arrow_back" flat round dense color="white" class="back-button" @click="goBack" />
      <div class="hero-overlay"></div>
    </div>

    <!-- Event Info Box -->
    <div class="content-wrapper">
      <div class="info-box">
        <h1 class="event-title">{{ event.title }}</h1>
        <p class="event-subtitle">{{ event.subtitle }}</p>

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
              <span class="info-value">{{ event.location }}</span>
            </div>
          </div>

          <div class="info-item">
            <q-icon name="confirmation_number" class="info-icon" />
            <div class="info-text">
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

.hero-image-container {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 50vh;
    min-height: 300px;
  }
}

.hero-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform, opacity;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.1);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
  z-index: 1;
}

.back-button {
  position: absolute;
  top: $spacing-4;
  left: $spacing-4;
  z-index: 10;
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
