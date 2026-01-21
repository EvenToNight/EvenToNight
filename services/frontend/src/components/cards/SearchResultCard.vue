<script setup lang="ts">
import type { SearchResult } from '@/api/utils/searchUtils'
import { useNavigation } from '@/router/utils'

interface Props {
  result: SearchResult
}

defineProps<Props>()
const { locale } = useNavigation()
const getResultIcon = (result: SearchResult): string => {
  if (result.type === 'event') return 'event'
  if (result.type === 'organization') return 'business'
  return 'person'
}

const getResultTypeLabel = (result: SearchResult): string => {
  if (result.type === 'event') return 'Event'
  if (result.type === 'organization') return 'Organization'
  return 'Member'
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

const formatDate = (date: Date): string => {
  return date.toLocaleDateString(locale.value, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="suggestion-item">
    <q-avatar
      size="32px"
      class="result-avatar"
      :class="{ 'event-avatar': result.type === 'event' }"
    >
      <img
        v-if="result.type === 'event' ? result.imageUrl : result.avatarUrl"
        :src="result.type === 'event' ? result.imageUrl : result.avatarUrl"
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
.suggestion-item {
  @include flex-center;
  gap: $spacing-3;
  padding: $spacing-3;
  cursor: pointer;
  transition: background-color $transition-fast;
  color: $color-text-primary;
  &:hover {
    background-color: $color-gray-100;
  }

  @include dark-mode {
    color: $color-text-white;

    &:hover {
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
