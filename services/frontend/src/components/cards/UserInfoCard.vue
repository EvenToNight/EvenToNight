<script setup lang="ts">
import type { UserInfo } from '@/api/types/users'
import { useNavigation } from '@/router/utils'

interface Props {
  user: UserInfo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [userId: string]
}>()

const { goToUserProfile } = useNavigation()

const handleClick = () => {
  emit('click', props.user.userId)
  goToUserProfile(props.user.userId)
}
</script>

<template>
  <div class="user-card" @click="handleClick">
    <q-avatar size="48px" class="user-avatar">
      <img v-if="user.avatar" :src="user.avatar" />
      <q-icon v-else name="person" size="24px" />
    </q-avatar>

    <div class="user-content">
      <div class="user-name">{{ user.name }}</div>
      <div class="user-username">@{{ user.username }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
  cursor: pointer;
  transition: all $transition-fast;
  border-radius: $radius-md;
  color: $color-text-primary;

  &:hover {
    background-color: $color-gray-200;
  }

  @include dark-mode {
    color: $color-text-white;

    &:hover {
      background-color: $color-gray-hover;
    }
  }

  .user-avatar {
    flex-shrink: 0;

    :deep(img) {
      object-fit: cover;
    }
  }

  .user-content {
    @include flex-column;
    flex: 1;
    min-width: 0;
    gap: $spacing-1;
  }

  .user-name {
    @include text-truncate;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $color-text-primary;

    @include dark-mode {
      color: $color-text-white;
    }
  }

  .user-username {
    @include text-truncate;
    font-size: $font-size-sm;
    color: $color-text-secondary;

    @include dark-mode {
      color: $color-text-dark;
    }
  }
}
</style>
