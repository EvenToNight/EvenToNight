<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import type { Ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import SearchBar from '@/components/navigation/SearchBar.vue'
import type { SearchResult } from '@/api/utils'
import EventCard from '@/components/cards/EventCard.vue'
import CardSlider from '@/components/cards/CardSlider.vue'
import Button from '@/components/buttons/basicButtons/Button.vue'
import { api } from '@/api'
import type { Event } from '@/api/types/events'
import { useNavigation } from '@/router/utils'

const { goToExplore } = useNavigation()
const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

inject<Ref<HTMLElement | null>>('pageContentSearchBarRef')
const showSearchInNavbar = inject<Ref<boolean>>('showSearchInNavbar')
const searchQuery = inject<Ref<string>>('searchQuery')
const searchResults = inject<Ref<SearchResult[]>>('searchResults')
const searchBarHasFocus = inject<Ref<boolean>>('searchBarHasFocus')
const showAuthDialog = inject<Ref<boolean>>('showAuthDialog')

const upcomingEvents = ref<Event[]>([])

const handleFavoriteToggle = async (eventId: string, isFavorite: boolean) => {
  if (!authStore.isAuthenticated || !authStore.user) {
    if (showAuthDialog) showAuthDialog.value = true
    return
  }

  try {
    if (isFavorite) {
      await api.interactions.likeEvent(eventId, authStore.user.id)
      console.log(`Event ${eventId} liked`)
    } else {
      await api.interactions.unlikeEvent(eventId, authStore.user.id)
    }
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

const handleSeeAllEvents = () => {
  console.log('See all events clicked')
  goToExplore()
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
  } catch (error) {
    console.error('Failed to load upcoming events:', error)
  }
})
</script>

<template>
  <div>
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
              <SearchBar
                ref="searchBarRef"
                v-model:search-query="searchQuery"
                v-model:search-results="searchResults"
                v-model:has-focus="searchBarHasFocus"
                :autofocus="searchBarHasFocus"
              />
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
            v-for="event in upcomingEvents"
            :id="event.id_event"
            :key="event.id_event"
            :image-url="event.poster"
            :title="event.title"
            :subtitle="event.location.name || event.location.city"
            :date="new Date(event.date)"
            :favorite="false"
            @favorite-toggle="handleFavoriteToggle(event.id_event, $event)"
            @auth-required="showAuthDialog = true"
          />
        </CardSlider>

        <div class="colored-box"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

    // Rounded corners only when viewport exceeds max-width
    @media (min-width: calc($app-max-width + 1px)) {
      border-radius: 24px;
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
