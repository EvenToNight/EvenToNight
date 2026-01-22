<template>
  <div class="category-selection">
    <div class="category-header">
      <h2 class="category-title">Explore by Category</h2>
      <p class="category-subtitle">Discover events based on your interests</p>
    </div>

    <div v-if="loading" class="loading-container">
      <q-spinner-dots color="primary" size="40px" />
    </div>

    <div v-else class="category-grid">
      <div
        v-for="category in categories"
        :key="category.category"
        class="category-card"
        @click="handleCategoryClick(category)"
      >
        <div class="category-icon-wrapper">
          <q-icon :name="getCategoryIcon(category.category)" size="36px" />
        </div>
        <h3 class="category-name">{{ category.category }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import type { TagCategory } from '@/api/interfaces/events'
import { useNavigation } from '@/router/utils'

const { goToExplore } = useNavigation()

const categories = ref<TagCategory[]>([])
const loading = ref(true)

const categoryIcons: Record<string, string> = {
  EventType: 'event',
  Venue: 'place',
  MusicStyle: 'music_note',
  Special: 'star',
  Target: 'group',
  Extra: 'add_circle',
  Music: 'music_note',
  Sports: 'sports_soccer',
  Arts: 'palette',
}

const getCategoryIcon = (category: string): string => {
  return categoryIcons[category] || 'category'
}

const handleCategoryClick = (category: TagCategory) => {
  goToExplore({ tags: category.tags })
}

onMounted(async () => {
  try {
    categories.value = await api.events.getTags()
  } catch (error) {
    console.error('Error loading categories:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@use 'sass:color';
@import '@/assets/styles/abstracts';

.category-selection {
  padding: $spacing-8 0;
  width: 100%;
}

.category-header {
  text-align: center;
  margin-bottom: $spacing-6;

  .category-title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    margin: 0 0 $spacing-2 0;

    @include dark-mode {
      color: $color-white;
    }
  }

  .category-subtitle {
    font-size: $font-size-base;
    color: $color-text-secondary;
    margin: 0;

    @include dark-mode {
      color: rgba($color-white, 0.7);
    }
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: $spacing-8 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-4;
  margin-top: $spacing-6;

  @media (max-width: $breakpoint-mobile) {
    grid-template-columns: 1fr;
    gap: $spacing-3;
  }
}

.category-card {
  background: $color-white;
  border-radius: 16px;
  padding: $spacing-5;
  cursor: pointer;
  transition: all $transition-slow;
  border: 2px solid $color-border;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: $spacing-4;

  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-lg;

    .category-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
    }
  }

  @include dark-mode {
    background: rgba(255, 255, 255, 0.05);
    border-color: transparent;
  }
}

.category-icon-wrapper {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba($color-primary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-slow;
  box-shadow: $shadow-md;

  .q-icon {
    color: $color-primary;
  }
}

.category-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin: 0;

  @include dark-mode {
    color: $color-white;
  }
}

.category-count {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  text-align: center;
  margin: 0 0 $spacing-3 0;

  @include dark-mode {
    color: rgba($color-white, 0.6);
  }
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-1;
  justify-content: center;
  margin-top: $spacing-3;

  .tag-preview {
    background: rgba($color-primary, 0.15);
    color: $color-primary;
    padding: $spacing-1 $spacing-2;
    border-radius: 12px;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    @include dark-mode {
      background: rgba($color-primary, 0.25);
      color: color.scale($color-primary, $lightness: 20%);
    }
  }

  .tag-more {
    background: rgba($color-text-secondary, 0.2);
    color: $color-text-secondary;
    padding: $spacing-1 $spacing-2;
    border-radius: 12px;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;

    @include dark-mode {
      background: rgba($color-white, 0.15);
      color: rgba($color-white, 0.7);
    }
  }
}
</style>
