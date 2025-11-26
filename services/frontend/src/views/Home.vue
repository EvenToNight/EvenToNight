<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import NavigationBar, { NAVBAR_HEIGHT } from '../components/NavigationBar.vue'
import SearchBar from '../components/SearchBar.vue'
import EventCard from '@/components/EventCard.vue'
import CardSlider from '@/components/CardSlider.vue'
import Footer from '@/components/Footer.vue'

const $q = useQuasar()
const { t } = useI18n()
const showSearchInNavbar = ref(false)
const searchQuery = ref('')
const searchBarHasFocus = ref(false)
const heroSearchPlaceholderRef = ref<HTMLElement | null>(null)

// Sample event data
const events = ref([
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    title: 'Techno vibes',
    subtitle: 'Coccorico - Riccione',
    date: new Date(2024, 11, 8),
    favorite: false,
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    title: 'House Music Night',
    subtitle: 'Fabric - London',
    date: new Date(2024, 11, 15),
    favorite: false,
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    title: 'Electronic Dreams',
    subtitle: 'Berghain - Berlin',
    date: new Date(2024, 11, 22),
    favorite: true,
  },
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    title: 'Techno vibes',
    subtitle: 'Coccorico - Riccione',
    date: new Date(2024, 11, 8),
    favorite: false,
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    title: 'House Music Night',
    subtitle: 'Fabric - London',
    date: new Date(2024, 11, 15),
    favorite: false,
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    title: 'Electronic Dreams',
    subtitle: 'Berghain - Berlin',
    date: new Date(2024, 11, 22),
    favorite: true,
  },
])

const handleFavoriteToggle = (eventId: number, isFavorite: boolean) => {
  const event = events.value.find((e) => e.id === eventId)
  if (event) {
    event.favorite = isFavorite
  }
}

const handleSeeAllEvents = () => {
  console.log('See all events clicked')
  // Navigate to events page or show all events
}

const toggleDarkMode = () => {
  $q.dark.toggle()
}

const handleScroll = () => {
  if (heroSearchPlaceholderRef.value) {
    const rect = heroSearchPlaceholderRef.value.getBoundingClientRect()
    showSearchInNavbar.value = rect.bottom <= NAVBAR_HEIGHT
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="navigation-view">
    <div class="scroll-wrapper">
      <NavigationBar
        v-model:search-query="searchQuery"
        v-model:has-focus="searchBarHasFocus"
        :show-search="showSearchInNavbar"
      />
      <div class="page-content">
        <div class="hero-section">
          <div class="hero-container">
            <div class="theme-selector-absolute">
              <q-btn
                :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
                :label="$q.dark.isActive ? 'Light Mode' : 'Dark Mode'"
                color="primary"
                @click="toggleDarkMode"
              />
            </div>

            <div class="hero-content">
              <h1 class="hero-title">{{ t('home.hero.title') }}</h1>
              <div ref="heroSearchPlaceholderRef" class="hero-search-wrapper">
                <div v-if="!showSearchInNavbar">
                  <SearchBar
                    ref="searchBarRef"
                    v-model:search-query="searchQuery"
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
            <CardSlider :title="t('home.sections.upcomingEvents')" @see-all="handleSeeAllEvents">
              <EventCard
                v-for="event in events"
                :key="event.id"
                :image-url="event.imageUrl"
                :title="event.title"
                :subtitle="event.subtitle"
                :date="event.date"
                :favorite="event.favorite"
                @favorite-toggle="handleFavoriteToggle(event.id, $event)"
              />
            </CardSlider>

            <div class="colored-box"></div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navigation-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.scroll-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.page-content {
  padding: 0;
  flex: 1;

  .container {
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
    padding: 0 $spacing-4;
    box-sizing: border-box;

    @media (max-width: 330px) {
      padding: 0 $spacing-2;
    }
  }
}

.hero-section {
  width: 100%;
  margin-bottom: $spacing-8;

  .hero-container {
    position: relative;
    background:
      linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
      url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80');
    background-size: cover;
    background-position: center;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-12 $spacing-4;
    border-radius: 0;
    transition: border-radius 0.3s ease;

    @media (max-width: 768px) {
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
    color: #fff;
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 $spacing-8 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2rem;
      margin: 0 0 $spacing-6 0;
    }

    @media (max-width: 480px) {
      font-size: 1.75rem;
    }
  }

  .hero-search-wrapper {
    max-width: 600px;
    margin: 0 auto;

    // Force light styling for search bar on black background
    :deep(.search-input) {
      background: transparent !important;
      box-shadow: none !important;
      outline: none !important;

      .q-field__control {
        background: #fff !important;
        color: #000 !important;
        border-radius: 8px;
        box-shadow: none !important;
        outline: none !important;
        border: none !important;
      }

      .q-field__native,
      input {
        color: #000 !important;
        text-align: left !important;
        outline: none !important;
      }

      .q-icon {
        color: #666 !important;
      }

      // Remove all outlines and borders
      .q-field__control:before,
      .q-field__control:after {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }

      // Remove focus ring
      &:focus,
      &:focus-within {
        outline: none !important;
        box-shadow: none !important;
      }
    }

    // Fix suggestions dropdown alignment and styling
    :deep(.suggestions-dropdown) {
      text-align: left !important;

      .suggestion-item {
        text-align: left !important;
      }
    }
  }
}

.content-section {
  margin-top: $spacing-8;

  h2 {
    margin-top: $spacing-8;
    margin-bottom: $spacing-6;
    font-size: 2rem;
    font-weight: 700;
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

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: $spacing-4;
    }
  }

  .colored-box {
    width: 100%;
    height: 800px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
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
