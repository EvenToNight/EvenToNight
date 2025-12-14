<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import EventDetailsHeader from '@/components/eventDetails/EventDetailsHeader.vue'
import EventDetailsBody from '@/components/eventDetails/EventDetailsBody.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useNavigation } from '@/router/utils'
import { ensureHttp } from '@/api/services/media'

const { params, goToHome } = useNavigation()
const eventId = computed(() => params.id as string)
const showAuthDialog = ref(false)

const event = ref<Event | null>(null)

const loadEvent = async () => {
  try {
    event.value = await api.events.getEventById(eventId.value)
  } catch (error) {
    console.error('Failed to load event:', error)
    goToHome()
  }
}

onMounted(async () => {
  await loadEvent()
})
</script>

<template>
  <div v-if="event" class="event-details-view">
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <EventDetailsHeader :posterLink="ensureHttp(event.poster)" :title="event.title" />
    <EventDetailsBody v-model:isAuthRequired="showAuthDialog" :event="event" />
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
</style>
