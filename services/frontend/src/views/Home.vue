<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import NavigationBar, { NAVBAR_HEIGHT } from '../components/NavigationBar.vue'
import SearchBar from '../components/SearchBar.vue'
import EventCard from '@/components/EventCard.vue'
import CardSlider from '@/components/CardSlider.vue'

const $q = useQuasar()
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
        <div class="container">
          <h4>Navigation Demo</h4>
          <p>This page demonstrates the Quasar navigation bar.</p>

          <div class="theme-selector">
            <q-btn
              :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
              :label="$q.dark.isActive ? 'Light Mode' : 'Dark Mode'"
              color="primary"
              @click="toggleDarkMode"
            />
          </div>
          <div ref="heroSearchPlaceholderRef" class="hero-search">
            <div v-if="!showSearchInNavbar" ref="heroSearchRef" class="hero-search-container">
              <SearchBar
                ref="searchBarRef"
                v-model:search-query="searchQuery"
                v-model:has-focus="searchBarHasFocus"
                :autofocus="searchBarHasFocus"
              />
            </div>
          </div>

          <div class="content-section">
            <CardSlider title="Upcoming Events" @see-all="handleSeeAllEvents">
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
          </div>
        </div>
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
  padding: $spacing-8 $spacing-4;
  flex: 1;

  @media (max-width: 330px) {
    padding: $spacing-4 $spacing-2;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  h1 {
    margin-bottom: $spacing-4;
  }

  .theme-selector {
    margin-top: $spacing-6;
  }
}

.hero-search {
  margin-bottom: $spacing-8;
  max-width: 600px;
  min-height: 40px;
  min-width: 20px;
  .hero-search-container {
    position: relative;
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
