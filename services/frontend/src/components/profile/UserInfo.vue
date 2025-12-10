<script setup lang="ts">
import type { User } from '@/api/types/users'
import { useI18n } from 'vue-i18n'

interface Props {
  user: User
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="user-info">
    <div class="network-info-row">
      <div class="stat-item">
        <span class="stat-value">{{ user.followers.toString() }}</span>
        <span class="stat-label">{{ t('userProfile.followers') }}</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value">{{ user.following.toString() }}</span>
        <span class="stat-label">{{ t('userProfile.following') }}</span>
      </div>
    </div>
    <p v-if="user.bio" class="user-bio">{{ user.bio }}</p>
  </div>
</template>

<style lang="scss" scoped>
.user-info {
  @include flex-column;
  flex: 1;
  gap: $spacing-2;
}

.network-info-row {
  display: flex;
  align-items: center;
  gap: $spacing-4;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: $spacing-1;
}

.stat-value {
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.stat-label {
  font-size: $font-size-sm;
  opacity: 0.6;
}

.stat-divider {
  width: 1px;
  height: 16px;
  background: color-alpha($color-black, 0.1);

  @include dark-mode {
    background: color-alpha($color-white, 0.2);
  }
}

.user-bio {
  font-size: $font-size-base;
  line-height: 1.6;
  margin: 0;
  opacity: 0.8;
  color: $color-text-primary;

  @media (max-width: $breakpoint-mobile) {
    text-align: center;
  }

  @include dark-mode {
    color: $color-text-dark;
  }
}
</style>
