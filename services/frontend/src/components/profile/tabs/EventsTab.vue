<script setup lang="ts">
import { ref } from 'vue'
import type { Event } from '@/api/types/events'
import EventCard from '@/components/cards/EventCard.vue'
import EmptyTab from '@/components/navigation/tabs/EmptyTab.vue'

interface Props {
  events: Event[]
  emptyText: string
  emptyIconName: string
  hasMore?: boolean
  onLoadMore?: () => void | Promise<void>
}

const props = defineProps<Props>()

const loading = ref(false)

const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
  if (!props.hasMore || !props.onLoadMore) {
    done(true)
    return
  }

  loading.value = true

  try {
    await props.onLoadMore()
  } finally {
    loading.value = false
    done(!props.hasMore)
  }
}
</script>

<template>
  <div class="event-tab">
    <q-infinite-scroll
      v-if="events.length > 0"
      :offset="250"
      class="events-scroll"
      :disable="loading"
      @load="onLoad"
    >
      <div class="events-grid">
        <EventCard v-for="(event, index) in events" :key="event.eventId" v-model="events[index]!" />
      </div>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <EmptyTab v-else :emptyText="emptyText" :emptyIconName="emptyIconName" />
  </div>
</template>

<style lang="scss" scoped>
.event-tab {
  @include flex-column;
  height: 100%;
}

.events-scroll {
  height: 100%;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-6;
  padding: $spacing-3;

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}
</style>
