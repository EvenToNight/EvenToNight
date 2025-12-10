<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNavigation } from '@/router/utils'
import type { Event } from '@/api/types/events'

interface Props {
  event: Event
}
const { t } = useI18n()
const { locale } = useNavigation()
const props = defineProps<Props>()

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

const locationAddress = computed(() => {
  const loc = props.event.location
  return [loc.name, loc.road, loc.house_number, loc.city, loc.province, loc.country]
    .filter(Boolean)
    .join(', ')
})
</script>
<template>
  <div class="info-list">
    <div class="info-item">
      <q-icon name="event" class="info-icon" />
      <div class="info-text">
        <span class="info-label">{{ t('date') }}</span>
        <span class="info-value">{{ formatDate(event.date) }}</span>
      </div>
    </div>

    <div class="info-item">
      <q-icon name="schedule" class="info-icon" />
      <div class="info-text">
        <span class="info-label">{{ t('time') }}</span>
        <span class="info-value">{{ formatTime(event.date) }}</span>
      </div>
    </div>

    <div class="info-item">
      <q-icon name="location_on" class="info-icon" />
      <div class="info-text">
        <span class="info-label">{{ t('location') }}</span>
        <span class="info-value">{{ locationAddress }}</span>
      </div>
      <a
        :href="props.event.location.link"
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
        <span class="info-label">{{ t('price') }}</span>
        <span class="info-value">€{{ event.price }}</span>
      </div>
    </div>
  </div>

  <div class="description-section">
    <h2 class="section-title">{{ t('eventDetails.about') }}</h2>
    <p class="event-description">{{ event.description }}</p>
  </div>
</template>

<style scoped lang="scss">
.info-list {
  @include flex-column;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
  padding: $spacing-4 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);

  @include dark-mode {
    border-top-color: rgba(255, 255, 255, 0.1);
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: $breakpoint-mobile) {
    gap: $spacing-3;
    padding: $spacing-3 0;
  }
}

.info-item {
  @include flex-center;
  gap: $spacing-3;

  @media (max-width: $breakpoint-mobile) {
    gap: $spacing-2;
  }
}

.info-icon {
  color: $color-primary;
  font-size: $font-size-2xl;
  flex-shrink: 0;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-xl;
  }
}

.info-text {
  @include flex-column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: $font-size-xs;
  opacity: 0.6;
  font-weight: $font-weight-medium;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  word-wrap: break-word;
  line-height: 1.3;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-sm;
  }
}

.description-section {
  margin-bottom: $spacing-8;
}

.section-title {
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  margin-bottom: $spacing-4;
}

.event-description {
  font-size: $font-size-base;
  line-height: 1.6;
}

.maps-link {
  @include flex-center;
  padding: $spacing-2;
  border-radius: $radius-lg;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  transition: all $transition-base;
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
}
</style>
