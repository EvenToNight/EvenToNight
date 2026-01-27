<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/navigation/SearchBar.vue'
import EventCard from '@/components/cards/EventCard.vue'
import CardSlider from '@/components/cards/CardSlider.vue'
import CategorySelection from '@/components/home/CategorySelection.vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useNavigation } from '@/router/utils'

const emit = defineEmits(['auth-required'])

const { goToExplore } = useNavigation()
const { t } = useI18n()
const authStore = useAuthStore()

const pageContentSearchBarRef = inject<Ref<HTMLElement | null>>('pageContentSearchBarRef')
const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar')
const upcomingEvents = ref<(Event & { liked?: boolean })[]>([])

const handleSeeAllEvents = () => {
  goToExplore({ otherFilter: 'upcoming' })
}

onMounted(async () => {
  try {
    const feedResponse = await api.feed.getUpcomingEvents()
    const eventsResponse = await api.events.getEventsByIds(feedResponse.items)
    upcomingEvents.value = eventsResponse.events

    if (authStore.isAuthenticated) {
      console.log('Loading likes for upcoming events')
      const userId = authStore.user!.id
      const likePromises = upcomingEvents.value.map(async (event) => {
        try {
          const isLiked = await api.interactions.userLikesEvent(event.eventId, userId)
          console.log(`Event ${event.eventId} liked: ${isLiked}`)
          event.liked = isLiked
        } catch (error) {
          console.error(`Failed to load like status for event ${event.eventId}:`, error)
          event.liked = false
        }
      })
      await Promise.all(likePromises)
    }
  } catch (error) {
    console.error('Failed to load upcoming events:', error)
  }
})
</script>

<template>
  <div class="home-view-content">
    <div class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">{{ t('home.hero.title') }}</h1>
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
          v-if="upcomingEvents.length > 0"
          :title="t('home.sections.upcomingEvents')"
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
          v-if="upcomingEvents.length > 0"
          :title="t('home.sections.upcomingEvents')"
          @see-all="handleSeeAllEvents"
        >
          <EventCard
            v-for="(event, index) in upcomingEvents"
            :key="event.eventId"
            v-model="upcomingEvents[index]!"
            @auth-required="emit('auth-required')"
          />
        </CardSlider>
        <CategorySelection />
        <CardSlider
          v-if="upcomingEvents.length > 0"
          :title="t('home.sections.upcomingEvents')"
          @see-all="handleSeeAllEvents"
        >
          <EventCard
            v-for="(event, index) in upcomingEvents"
            :key="event.eventId"
            v-model="upcomingEvents[index]!"
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
  background: #f5f5f5;
  @include dark-mode {
    background: $color-background-dark;
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
