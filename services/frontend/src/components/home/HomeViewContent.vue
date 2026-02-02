<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import type { Ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/navigation/SearchBar.vue'
import EventCard from '@/components/cards/EventCard.vue'
import CardSlider from '@/components/cards/CardSlider.vue'
import CategorySelection from '@/components/home/CategorySelection.vue'
import type { Event } from '@/api/types/events'
import { useNavigation } from '@/router/utils'
import { loadEvents, type EventLoadResult } from '@/api/utils/eventUtils'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'

const emit = defineEmits(['auth-required'])

const { goToExplore, goToUserProfile } = useNavigation()
const { t } = useTranslation('components.home.HomeViewContent')
const logger = createLogger(import.meta.url)
const authStore = useAuthStore()
const pageContentSearchBarRef = inject<Ref<HTMLElement | null>>('pageContentSearchBarRef')
const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar')
const upcomingEvents = ref<EventLoadResult[]>([])
const newestEvents = ref<EventLoadResult[]>([])
const popularEvents = ref<EventLoadResult[]>([])
const myDrafts = ref<Event[]>([])
const handleSeeAllEvents = () => {
  goToExplore({ otherFilter: 'upcoming' })
}

onMounted(async () => {
  try {
    const userId = authStore.user?.id
    upcomingEvents.value = (
      await loadEvents({
        userId,
        other: 'upcoming',
        pagination: { limit: 10, offset: 0 },
      })
    ).items
    popularEvents.value = (
      await loadEvents({
        userId,
        other: 'popular',
        pagination: { limit: 10, offset: 0 },
      })
    ).items
    newestEvents.value = (
      await loadEvents({
        userId,
        other: 'recently_added',
        pagination: { limit: 10, offset: 0 },
      })
    ).items

    if (authStore.isOrganization) {
      myDrafts.value = (
        await loadEvents({
          pagination: { limit: 10, offset: 0 },
          status: 'DRAFT',
          organizationId: authStore.user!.id,
        })
      ).items
    }
  } catch (error) {
    logger.error('Failed to load home view content:', error)
  }
})
</script>

<template>
  <div class="home-view-content">
    <div class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">{{ t('title') }}</h1>
          <div ref="pageContentSearchBarRef" class="hero-search-wrapper">
            <div v-if="!showSearchInNavbar">
              <SearchBar ref="searchBarRef" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="content-section">
        <CardSlider
          v-if="myDrafts.length > 0"
          :title="t('draftSectionTitle')"
          @see-all="goToUserProfile(authStore.user!.id, '#drafted')"
        >
          <EventCard
            v-for="(event, index) in myDrafts"
            :key="event.eventId"
            v-model="myDrafts[index]!"
          />
        </CardSlider>
        <CardSlider
          v-else-if="upcomingEvents.length > 0"
          :title="t('upcomingEventsSectionTitle')"
          @see-all="handleSeeAllEvents"
        >
          <EventCard
            v-for="(event, index) in upcomingEvents"
            :key="event.eventId"
            v-model="upcomingEvents[index]!"
            @auth-required="emit('auth-required')"
          />
        </CardSlider>
        <CardSlider
          v-if="popularEvents.length > 0"
          :title="t('popularEventsSectionTitle')"
          @see-all="handleSeeAllEvents"
        >
          <EventCard
            v-for="(event, index) in popularEvents"
            :key="event.eventId"
            v-model="popularEvents[index]!"
            @auth-required="emit('auth-required')"
          />
        </CardSlider>

        <CategorySelection />
        <CardSlider
          v-if="newestEvents.length > 0"
          :title="t('newestSectionTitle')"
          @see-all="handleSeeAllEvents"
        >
          <EventCard
            v-for="(event, index) in newestEvents"
            :key="event.eventId"
            v-model="newestEvents[index]!"
            @auth-required="emit('auth-required')"
          />
        </CardSlider>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-view-content {
  width: 100%;
  min-height: 100%;
  background: $grey-2;
  @include dark-mode {
    background: $grey-10;
  }
}

.container {
  max-width: $breakpoint-xl;
  margin: 0 auto;
  width: 100%;
  padding: 0 $spacing-4;
  box-sizing: border-box;

  @media (max-width: $app-min-width) {
    padding: 0 $spacing-2;
  }
}

.hero-section {
  width: 100%;
  margin-bottom: $spacing-8;

  .hero-container {
    @include flex-center;
    position: relative;
    background:
      linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
      url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80');
    background-size: cover;
    background-position: center;
    min-height: 400px;
    padding: $spacing-12 $spacing-4;
    border-radius: 0;
    transition: border-radius $transition-slow;

    @media (max-width: $breakpoint-mobile) {
      min-height: 350px;
      padding: $spacing-10 $spacing-4;
    }

    @media (min-width: calc($app-max-width + 1px)) {
      border-bottom-left-radius: 24px;
      border-bottom-right-radius: 24px;
    }
  }

  .hero-content {
    max-width: 800px;
    width: 100%;
    text-align: center;
  }

  .hero-title {
    color: $color-white;
    font-size: $font-size-5xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-8;
    line-height: 1.2;

    @media (max-width: $breakpoint-mobile) {
      font-size: $font-size-3xl;
      margin-bottom: $spacing-6;
    }

    @media (max-width: $breakpoint-xs) {
      font-size: $font-size-2xl;
    }
  }

  .hero-search-wrapper {
    max-width: 600px;
    margin: 0 auto;

    :deep(.suggestions-dropdown) {
      text-align: left;
    }
  }
}

.content-section {
  margin-top: $spacing-8;
  padding-bottom: $spacing-8;

  h2 {
    margin-top: $spacing-8;
    margin-bottom: $spacing-6;
    font-size: $font-size-4xl;
    font-weight: $font-weight-bold;
  }

  h3 {
    margin-top: $spacing-6;
    margin-bottom: $spacing-3;
  }

  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: $spacing-6;
    margin-bottom: $spacing-8;

    @media (max-width: $breakpoint-mobile) {
      grid-template-columns: 1fr;
      gap: $spacing-4;
    }
  }

  p {
    margin-bottom: $spacing-4;
    line-height: 1.6;
  }

  ul {
    margin-bottom: $spacing-4;
    padding-left: $spacing-6;

    li {
      margin-bottom: $spacing-2;
      line-height: 1.6;
    }
  }
}
</style>
