<script setup lang="ts">
import Button from '@/components/buttons/basicButtons/Button.vue'

interface Ticket {
  id: string
  eventName: string
  eventImageLink: string
  ticketNumber: string
}

interface Props {
  ticket: Ticket
}

defineProps<Props>()

const emit = defineEmits<{
  download: [ticketId: string]
}>()

const handleDownload = (ticketId: string) => {
  emit('download', ticketId)
}
</script>

<template>
  <div class="ticket-card">
    <div class="ticket-content">
      <div class="event-image-wrapper">
        <img :src="ticket.eventImageLink" :alt="ticket.eventName" class="event-image" />
      </div>

      <div class="event-info">
        <h3 class="event-name">{{ ticket.eventName }}</h3>
        <p class="ticket-number">Ticket #{{ ticket.ticketNumber }}</p>
      </div>

      <Button
        icon="download"
        variant="primary"
        class="download-button download-button-desktop"
        label="Download"
        @click="handleDownload(ticket.id)"
      />
      <Button
        icon="download"
        variant="primary"
        class="download-button download-button-mobile"
        @click="handleDownload(ticket.id)"
      />
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

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.event-name {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  margin: 0;
  color: $color-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @include dark-mode {
    color: $color-text-white;
  }

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-base;
  }
}

.ticket-number {
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

.download-button {
  flex-shrink: 0;
}

.download-button-mobile {
  display: none;

  @media (max-width: $breakpoint-mobile) {
    display: inline-flex;
  }
}

.download-button-desktop {
  display: inline-flex;

  @media (max-width: $breakpoint-mobile) {
    display: none;
  }
}
</style>
