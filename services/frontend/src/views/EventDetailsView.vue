<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import NavigationWithParallaxEffect from '@/layouts/NavigationWithParallaxEffect.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import EventDetailsHeader from '@/components/eventDetails/EventDetailsHeader.vue'
import EventInfo from '@/components/eventDetails/EventInfo.vue'
import OrganizationInfo from '@/components/eventDetails/OrganizationInfo.vue'
import EventDetailsActions from '@/components/eventDetails/EventDetailsActions.vue'
import EventReviewsPreview from '@/components/eventDetails/EventReviewsPreview.vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useNavigation } from '@/router/utils'
import type { EventTicketType } from '@/api/types/payments'
import { NOT_FOUND_ROUTE_NAME } from '@/router'
import { createLogger } from '@/utils/logger'
import { useRoute } from 'vue-router'

const logger = createLogger(import.meta.url)
const { params, goToRoute } = useNavigation()
const route = useRoute()
const eventId = computed(() => params.id as string)
const showAuthDialog = ref(false)

const event = ref<Event | null>(null)
const eventTickets = ref<EventTicketType[]>([])

const loadEvent = async () => {
  try {
    event.value = await api.events.getEventById(eventId.value)
    if (event.value && event.value.status === 'PUBLISHED') {
      eventTickets.value = await api.payments.getEventTicketsType(eventId.value)
    }
  } catch (error) {
    logger.error('Failed to load event:', error)
    goToRoute(NOT_FOUND_ROUTE_NAME)
  }
}

onMounted(async () => {
  await loadEvent()
})
</script>

<template>
  <div v-if="event" class="event-details-view">
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" :redirect="route.fullPath" />
    <NavigationWithParallaxEffect :posterLink="event.poster" :title="event.title">
      <div class="content-wrapper">
        <div class="info-box">
          <EventDetailsHeader :event="event" @authRequired="showAuthDialog = true" />
          <EventInfo :event="event" :eventTickets="eventTickets" />
          <OrganizationInfo :event="event" />
          <EventDetailsActions
            v-if="event.status === 'PUBLISHED'"
            :event="event"
            :eventTickets="eventTickets"
            @authRequired="showAuthDialog = true"
          />
          <EventReviewsPreview
            v-else-if="event.status === 'COMPLETED'"
            :eventId="event.eventId"
            :organizationId="event.creatorId"
          />
        </div>
      </div>
    </NavigationWithParallaxEffect>
  </div>
</template>

<style lang="scss" scoped>
.event-details-view {
  @include flex-column;
  min-height: 100vh;
  background: $color-background;

  @include dark-mode {
    background: $color-background-dark;
  }
}

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
