<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EventReview } from '@/api/types/interaction'
import RatingStars from './RatingStars.vue'
import { api } from '@/api'

interface Props {
  review: EventReview
}

const props = defineProps<Props>()

const userName = ref<string>('Loading...')
const userAvatar = ref<string | null>(null)

const loadUserInfo = async () => {
  try {
    const response = await api.users.getUserById(props.review.userId)
    userName.value = response.user.name || 'Anonymous'
    userAvatar.value = response.user.avatarUrl || null
  } catch (error) {
    console.error('Failed to load user info:', error)
    userName.value = 'Unknown User'
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="review-card">
    <div class="review-header">
      <div class="user-info">
        <q-avatar size="40px" class="user-avatar">
          <img v-if="userAvatar" :src="userAvatar" :alt="userName" />
          <q-icon v-else name="person" />
        </q-avatar>
        <div class="user-details">
          <span class="user-name">{{ userName }}</span>
          <RatingStars :rating="review.rating" size="sm" />
        </div>
      </div>
    </div>

    <div class="review-body">
      <p class="review-description">{{ review.description }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.review-card {
  background: $color-background;
  border-radius: $radius-lg;
  padding: $spacing-4;
  box-shadow: $shadow-sm;
  transition: all $transition-base;

  @include dark-mode {
    background: $color-background-dark;
  }

  &:hover {
    box-shadow: $shadow-md;
  }
}

.review-header {
  margin-bottom: $spacing-3;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
}

.user-avatar {
  background: $color-primary-light;

  @include dark-mode {
    background: $color-primary-dark;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .q-icon {
    color: $color-primary;
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.user-name {
  font-weight: 600;
  font-size: $font-size-base;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-heading-dark;
  }
}

.review-body {
  padding-left: calc(40px + #{$spacing-3});
}

.review-description {
  color: $color-text-secondary;
  font-size: $font-size-sm;
  line-height: 1.6;
  margin: 0;

  @include dark-mode {
    color: $color-text-dark;
  }
}
</style>
