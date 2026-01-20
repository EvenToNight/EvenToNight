<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import type { Ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/navigation/SearchBar.vue'
import EventCard from '@/components/cards/EventCard.vue'
import CardSlider from '@/components/cards/CardSlider.vue'
import CategorySelection from '@/components/home/CategorySelection.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useNavigation } from '@/router/utils'

const emit = defineEmits(['auth-required'])

const { goToExplore } = useNavigation()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

const pageContentSearchBarRef = inject<Ref<HTMLElement | null>>('pageContentSearchBarRef')
const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar')
const upcomingEvents = ref<Event[]>([])
const eventLikes = ref<Record<string, boolean>>({})

const handleSeeAllEvents = () => {
  console.log('See all events clicked')
  goToExplore({ otherFilter: 'upcoming' })
}

const toggleDarkMode = () => {
  $q.dark.toggle()
  localStorage.setItem('darkMode', $q.dark.isActive ? 'true' : 'false')
}

onMounted(async () => {
  try {
    const feedResponse = await api.feed.getUpcomingEvents()
    const eventsResponse = await api.events.getEventsByIds(feedResponse.items)
    upcomingEvents.value = eventsResponse.events

    // Load like status for each event in parallel
    if (authStore.user?.id) {
      const userId = authStore.user.id
      console.log('Loading like status for user:', userId)
      const likePromises = upcomingEvents.value.map(async (event) => {
        console.log('Checking like status for event:', event.eventId)
        try {
          const isLiked = await api.interactions.userLikesEvent(event.eventId, userId)
          console.log(`Event ${event.eventId} is liked by user: ${isLiked}`)
          eventLikes.value[event.eventId] = isLiked
        } catch (error) {
          console.error(`Failed to load like status for event ${event.eventId}:`, error)
          eventLikes.value[event.eventId] = false
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
        <div class="theme-selector-absolute">
          <Button
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            :label="$q.dark.isActive ? t('theme.light_mode') : t('theme.dark_mode')"
            variant="primary"
            @click="toggleDarkMode"
          />
        </div>

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

        <div class="colored-box"></div>
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

  .theme-selector-absolute {
    position: absolute;
    top: $spacing-4;
    right: $spacing-4;
    z-index: 10;
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

  .colored-box {
    width: 100%;
    height: 800px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: $radius-xl;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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
