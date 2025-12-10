<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Event } from '@/api/types/events'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'

interface Props {
  event: Event
  isAuthRequired: boolean
}

const emit = defineEmits(['update:isAuthRequired'])

const props = defineProps<Props>()
const authStore = useAuthStore()

const isFavorite = ref(false)
const likesCount = ref(0)

const loadInteractions = async () => {
  try {
    const interaction = await api.interactions.getEventInteractions(props.event.id)
    likesCount.value = interaction.likes.length
    if (authStore.user?.id) {
      isFavorite.value = interaction.likes.includes(authStore.user.id)
    }
  } catch (error) {
    console.error('Failed to load interactions:', error)
    likesCount.value = 0
    isFavorite.value = false
  }
}

const toggleLike = async () => {
  if (!authStore.isAuthenticated) {
    emit('update:isAuthRequired', true)
    return
  }
  const wasLiked = isFavorite.value

  // Optimistic update
  isFavorite.value = !isFavorite.value
  likesCount.value += isFavorite.value ? 1 : -1

  try {
    if (!wasLiked) {
      await api.interactions.likeEvent(props.event.id, authStore.user!.id)
    } else {
      await api.interactions.unlikeEvent(props.event.id, authStore.user!.id)
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
    isFavorite.value = wasLiked
    likesCount.value += wasLiked ? 1 : -1
  }
}

onMounted(async () => {
  await loadInteractions()
})
</script>
<template>
  <div class="title-row">
    <div class="title-content">
      <h1 class="event-title">{{ props.event.title }}</h1>
      <p class="event-subtitle">{{ props.event.location.name || props.event.location.city }}</p>
    </div>
    <button class="like-button" :class="{ liked: isFavorite }" @click="toggleLike">
      <q-icon :name="isFavorite ? 'favorite' : 'favorite_border'" size="24px" />
      <span class="like-count">{{ likesCount }}</span>
    </button>
  </div>

  <div v-if="props.event.tags && props.event.tags.length" class="tags-container">
    <span v-for="tag in props.event.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
  </div>
</template>

<style scoped lang="scss">
.title-row {
  @include flex-between;
  align-items: flex-start;
  gap: $spacing-4;
  margin-bottom: $spacing-4;

  @media (max-width: $breakpoint-mobile) {
    flex-direction: column;
    gap: $spacing-3;
  }
}

.title-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  line-height: 1.2;
  margin-bottom: $spacing-2;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-3xl;
  }
}

.event-subtitle {
  font-size: $font-size-xl;
  color: $color-primary;
  font-weight: $font-weight-medium;
}

.like-button {
  @include flex-center;
  gap: $spacing-2;
  padding: $spacing-3;
  border-radius: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  cursor: pointer;
  transition: all $transition-base;
  flex-shrink: 0;
  color: $color-text-primary;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  &.liked {
    background: rgba($color-primary, 0.1);
    border-color: $color-primary;
    color: $color-primary;

    .q-icon {
      color: $color-primary;
    }
  }

  @include dark-mode {
    border-color: rgba(255, 255, 255, 0.15);
    color: $color-text-dark;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}

.like-count {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin-bottom: $spacing-6;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: $spacing-2;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  background: $color-primary;
  cursor: default;
}
</style>
