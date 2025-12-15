<script setup lang="ts">
import type { User } from '@/api/types/users'
import { useNavigation } from '@/router/utils'

interface Props {
  user: User
}

const props = defineProps<Props>()
const { goToUserProfile } = useNavigation()

const handleClick = () => {
  goToUserProfile(props.user.id)
}
</script>

<template>
  <div class="user-card" @click="handleClick">
    <q-avatar size="64px" class="user-avatar">
      <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name" />
      <q-icon v-else name="person" size="32px" />
    </q-avatar>

    <div class="user-info">
      <h3 class="user-name">{{ user.name }}</h3>
      <p v-if="user.bio" class="user-bio">{{ user.bio }}</p>
      <div class="user-type">
        <q-icon :name="user.role === 'organization' ? 'business' : 'person'" size="16px" />
        <span>{{ user.role === 'organization' ? 'Organizzazione' : 'Utente' }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-card {
  @include flex-between;
  gap: $spacing-4;
  padding: $spacing-4;
  border-radius: $radius-lg;
  background: $color-white;
  border: 1px solid $color-border;
  cursor: pointer;
  transition: all $transition-base;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
    border-color: $color-primary;
  }

  @include dark-mode {
    background: $color-background-dark;
    border-color: $color-border-dark;
  }
}

.user-avatar {
  flex-shrink: 0;
  background: $color-gray-200;

  @include dark-mode {
    background: $color-gray-700;
  }
}

.user-info {
  @include flex-column;
  gap: $spacing-2;
  flex: 1;
  min-width: 0;
}

.user-name {
  margin: 0;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-heading;
  @include text-truncate;

  @include dark-mode {
    color: $color-white;
  }
}

.user-bio {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  @include line-clamp(2);

  @include dark-mode {
    color: $color-text-dark;
  }
}

.user-type {
  @include flex-center;
  gap: $spacing-1;
  font-size: $font-size-xs;
  color: $color-text-secondary;

  @include dark-mode {
    color: $color-text-dark;
  }
}
</style>
