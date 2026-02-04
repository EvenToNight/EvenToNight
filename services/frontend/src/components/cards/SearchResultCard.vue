<script setup lang="ts">
import type { SearchResult } from '@/api/utils/searchUtils'
import { useTranslation } from '@/composables/useTranslation'
import { useNavigation } from '@/router/utils'

interface Props {
  result: SearchResult
  isSelected?: boolean
}

defineProps<Props>()
const { locale } = useNavigation()
const { t } = useTranslation('components.cards.SearchResultCard')
const getResultIcon = (result: SearchResult): string => {
  if (result.type === 'event') return 'event'
  if (result.type === 'organization') return 'business'
  return 'person'
}

const getResultTypeLabel = (result: SearchResult): string => {
  if (result.type === 'event') return t('event')
  if (result.type === 'organization') return t('organization')
  return t('member')
}

const getResultPrimaryText = (result: SearchResult): string => {
  return result.type === 'event' ? result.title : result.name
}

const getResultSecondaryText = (result: SearchResult): string => {
  if (result.type === 'event') {
    return `${result.location} • ${formatDate(result.date)}`
  }
  return ''
}

const getResultTertiaryText = (result: SearchResult): string => {
  if (result.type === 'event' && result.status !== 'PUBLISHED') {
    return result.status
  }
  return ''
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(locale.value, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="suggestion-item" :class="{ selected: isSelected }">
    <q-avatar
      size="32px"
      class="result-avatar"
      :class="{ 'event-avatar': result.type === 'event' }"
    >
      <img
        v-if="result.type === 'event' ? result.imageUrl : result.avatarUrl"
        :src="result.type === 'event' ? result.imageUrl : result.avatarUrl"
        :alt="result.type === 'event' ? t('eventPosterAlt') : t('userAvatarAlt')"
      />
      <q-icon v-else :name="getResultIcon(result)" size="20px" />
    </q-avatar>

    <div class="result-content">
      <div class="result-primary">{{ getResultPrimaryText(result) }}</div>
      <div class="result-secondary">
        <span class="result-type">{{ getResultTypeLabel(result) }}</span>
        <span v-if="getResultSecondaryText(result)" class="result-detail">
          • {{ getResultSecondaryText(result) }}
        </span>
      </div>
      <div v-if="getResultTertiaryText(result)" class="result-tertiary">
        {{ getResultTertiaryText(result) }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.suggestion-item {
  @include flex-center;
  gap: $spacing-3;
  padding: $spacing-3;
  cursor: pointer;
  transition: all $transition-fast;
  background-color: $color-white;

  &:hover {
    background-color: $color-gray-200;
  }

  &.selected {
    background-color: $color-gray-200;
  }

  @include dark-mode {
    color: $color-text-white;
    background-color: $color-background-dark;
    &:hover {
      background-color: $color-gray-hover;
    }

    &.selected {
      background-color: $color-gray-hover;
    }
  }

  .result-avatar {
    flex-shrink: 0;

    :deep(img) {
      object-fit: cover;
    }
  }

  .event-avatar {
    border-radius: $radius-md;
  }

  .result-content {
    @include flex-column;
    flex: 1;
    min-width: 0;
    gap: $spacing-1;
  }

  .result-primary {
    @include text-truncate;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;

    @include dark-mode {
      color: $color-text-white;
    }
  }

  .result-secondary {
    @include text-truncate;
    font-size: $font-size-xs;
    gap: $spacing-1;
    color: $color-text-secondary;

    @include dark-mode {
      color: $color-text-dark;
    }
  }

  .result-tertiary {
    @include text-truncate;
    font-size: $font-size-xs;
    color: $color-text-muted;
    font-style: italic;

    @include dark-mode {
      color: rgba($color-text-dark, 0.7);
    }
  }

  .result-type {
    font-weight: $font-weight-semibold;
    text-transform: uppercase;
    font-size: $font-size-xs;
    letter-spacing: 0.5px;
    color: $color-primary;
  }

  .result-detail {
    @include text-truncate;
  }
}
</style>
