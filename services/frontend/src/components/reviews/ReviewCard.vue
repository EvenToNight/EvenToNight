<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { EventReview } from '@/api/types/interaction'
import RatingStars from './RatingStars.vue'
import { api } from '@/api'
import { useNavigation } from '@/router/utils'

interface Props {
  review: EventReview
}

const props = defineProps<Props>()
const { goToUserProfile } = useNavigation()

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

const handleUserClick = () => {
  goToUserProfile(props.review.userId)
}

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="review-card">
    <div class="review-header">
      <div class="user-info">
        <q-avatar size="40px" class="user-avatar" @click="handleUserClick">
          <img v-if="userAvatar" :src="userAvatar" :alt="userName" />
          <q-icon v-else name="person" />
        </q-avatar>
        <div class="user-details">
          <span class="user-name" @click="handleUserClick">{{ userName }}</span>
          <RatingStars :rating="review.rating" size="sm" />
        </div>
      </div>
    </div>

    <div class="review-body">
      <h3 v-if="review.title" class="review-title">{{ review.title }}</h3>
      <p class="review-description">{{ review.comment }}</p>
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
  cursor: pointer;
  transition: transform $transition-base;

  &:hover {
    transform: scale(1.05);
  }

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
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    text-decoration: underline;
    color: $color-primary;
  }

  @include dark-mode {
    color: $color-heading-dark;
  }
}

.review-body {
  padding-left: calc(40px + #{$spacing-3});
}

.review-title {
  font-size: $font-size-lg;
  font-weight: 600;
  color: $color-text-primary;
  margin: 0 0 $spacing-2 0;

  @include dark-mode {
    color: $color-heading-dark;
  }
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
