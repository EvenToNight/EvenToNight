<script setup lang="ts">
import type { Event } from '@/api/types/events'
import { useTicketDownload } from '@/composables/useTicketDownload'
import { useNavigation } from '@/router/utils'

interface Props {
  event: Event
}

defineProps<Props>()

const { goToEventDetails } = useNavigation()
const { downloadTickets } = useTicketDownload()
</script>

<template>
  <div class="ticket-card">
    <div class="ticket-content">
      <div class="event-image-wrapper clickable" @click="goToEventDetails(event.eventId)">
        <img :src="event.poster" :alt="event.title" class="event-image" />
      </div>

      <div class="event-info">
        <h3 class="event-name clickable" @click="goToEventDetails(event.eventId)">
          {{ event.title }}
        </h3>
        <p class="event-date">{{ new Date(event.date).toLocaleDateString() }}</p>
      </div>

      <q-btn flat round icon="download" @click="downloadTickets(event)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ticket-card {
  background: $color-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-base;
  padding: $spacing-4;

  @include dark-mode {
    background: $color-background-dark;
  }
}

.ticket-content {
  display: flex;
  align-items: center;
  gap: $spacing-4;

  @media (max-width: $breakpoint-mobile) {
    gap: $spacing-3;
  }
}

.event-image-wrapper {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: $radius-lg;
  overflow: hidden;

  @media (max-width: $breakpoint-mobile) {
    width: 60px;
    height: 60px;
  }
}

.clickable {
  cursor: pointer;
  transition: opacity $transition-base;

  &:hover {
    opacity: 0.8;
  }
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-info {
  @include flex-column;
  flex: 1;
  min-width: 0;
  gap: $spacing-1;
}

.event-name {
  @include text-truncate;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin: 0;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-white;
  }

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-base;
  }
}

.event-date {
  font-size: $font-size-sm;
  margin: 0;
  color: $color-text-secondary;

  @include dark-mode {
    color: $color-text-dark;
  }

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-xs;
  }
}
</style>
