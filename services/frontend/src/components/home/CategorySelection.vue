<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import type { TagCategory } from '@/api/interfaces/events'
import { useNavigation } from '@/router/utils'
import LoadableComponent from '../common/LoadableComponent.vue'
import { createLogger } from '@/utils/logger'
import { useTranslation } from '@/composables/useTranslation'

const { goToExplore } = useNavigation()
const { t } = useTranslation('components.home.CategorySelection')
const categories = ref<TagCategory[]>([])
const loading = ref(true)
const logger = createLogger(import.meta.url)

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
    logger.error('Error loading categories:', error)
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <loadable-component :loading="loading">
    <div class="category-selection q-py-lg">
      <div class="text-center q-mb-lg">
        <h2 class="category-title q-mb-sm">{{ t('title') }}</h2>
        <p class="category-subtitle q-ma-none">{{ t('subtitle') }}</p>
      </div>

      <div class="category-grid row justify-center q-mt-lg">
        <div
          v-for="category in categories"
          :key="category.category"
          class="category-card row items-center"
          role="button"
          tabindex="0"
          @click="handleCategoryClick(category)"
          @keydown.enter="handleCategoryClick(category)"
        >
          <div class="category-icon-wrapper flex items-center justify-center">
            <q-icon :name="getCategoryIcon(category.category)" size="36px" />
          </div>
          <h3 class="category-name q-ma-none">{{ category.category }}</h3>
        </div>
      </div>
    </div>
  </loadable-component>
</template>
<style scoped lang="scss">
@use 'sass:color';
@import '@/assets/styles/abstracts';

.category-selection {
  width: 100%;
}

.category-title {
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-white;
  }
}

.category-subtitle {
  font-size: $font-size-base;
  color: $color-text-secondary;

  @include dark-mode {
    color: rgba($color-white, 0.7);
  }
}

.category-grid {
  flex-wrap: wrap;
  gap: $spacing-4;

  @media (max-width: $breakpoint-mobile) {
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
  gap: $spacing-4;
  flex: 0 1 calc(25% - $spacing-4);
  min-width: 280px;

  @media (max-width: $breakpoint-mobile) {
    flex: 1 1 100%;
  }

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

  @include dark-mode {
    color: $color-white;
  }
}
</style>
