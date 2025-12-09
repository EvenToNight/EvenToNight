<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Event } from '@/api/types/events'
import EventCardVariant from '@/components/cards/EventCardVariant.vue'

interface Props {
  events: Event[]
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="drafted-tab">
    <div v-if="events.length > 0" class="events-grid">
      <EventCardVariant v-for="event in events" :key="event.id" :event="event" />
    </div>

    <div v-else class="empty-state">
      <q-icon name="edit_note" size="64px" />
      <p class="empty-text">
        {{ t('profile.noDraftedEvents') }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.drafted-tab {
  @include flex-column;
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

.empty-state {
  @include flex-column-center;
  padding: $spacing-12 $spacing-6;
  gap: $spacing-4;
}

.empty-text {
  font-size: $font-size-base;
  opacity: 0.6;
  margin: 0;
}
</style>
