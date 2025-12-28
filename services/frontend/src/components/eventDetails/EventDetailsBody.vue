<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Event } from '@/api/types/events'
import EventDetailsBodyHeader from './EventDetailsBodyHeader.vue'
import EventDetailsBodyInfo from './EventDetailsBodyInfo.vue'
import EventDetailsOrganizationInfo from './EventDetailsOrganizationInfo.vue'
import EventReviewsPreview from './EventReviewsPreview.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'

interface Props {
  event: Event
  isAuthRequired: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  'update:isAuthRequired': [boolean]
}>()
const { t } = useI18n()
</script>

<template>
  <div class="content-wrapper">
    <div class="info-box">
      <EventDetailsBodyHeader
        :event="event"
        :isAuthRequired="isAuthRequired"
        @update:is-auth-required="emit('update:isAuthRequired', $event)"
      />
      <EventDetailsBodyInfo :event="event" />
      <EventDetailsOrganizationInfo :event="event" />
      <Button
        v-if="event.status === 'PUBLISHED'"
        variant="primary"
        :label="t('eventDetails.buyTickets')"
        :class="'full-width'"
        size="lg"
      />
      <EventReviewsPreview
        v-else-if="event.status === 'COMPLETED'"
        :eventId="event.id_event"
        :organizationId="event.id_creator"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.content-wrapper {
  flex: 1;
  max-width: $breakpoint-xl;
  margin: 0 auto;
  width: 100%;
  padding: 0 $spacing-4 $spacing-8;
  box-sizing: border-box;
}

.info-box {
  background: $color-background;
  border-radius: $radius-3xl;
  padding: $spacing-8;
  margin-top: -$spacing-12;
  position: relative;
  box-shadow: $shadow-lg;
  transition: all $transition-base;

  @include dark-mode {
    background: $color-background-dark;
  }
}
</style>
