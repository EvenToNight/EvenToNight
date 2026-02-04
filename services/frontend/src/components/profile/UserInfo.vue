<script setup lang="ts">
import { ref } from 'vue'
import type { UserLoadResult } from '@/api/utils/userUtils'
import type { PaginatedRequest } from '@/api/interfaces/commons'
import UserList from '../user/UserList.vue'
import { api } from '@/api'
import { useTranslation } from '@/composables/useTranslation'

interface Props {
  user: UserLoadResult
}

const props = defineProps<Props>()

const { t } = useTranslation('components.profile.UserInfo')

const showFollowersDialog = ref(false)
const showFollowingDialog = ref(false)

const openFollowers = () => {
  showFollowersDialog.value = true
}

const openFollowing = () => {
  showFollowingDialog.value = true
}

const loadFollowersFn = (pagination?: PaginatedRequest) =>
  api.interactions.followers(props.user.id, pagination)
const loadFollowingFn = (pagination?: PaginatedRequest) =>
  api.interactions.following(props.user.id, pagination)
</script>

<template>
  <div v-if="user.interactionsInfo" class="user-info">
    <div class="network-info-row">
      <div
        class="stat-item clickable"
        role="button"
        tabindex="0"
        @click="openFollowers"
        @keydown.enter="openFollowers"
      >
        <span class="stat-value">{{ user.interactionsInfo.followers.toString() }}</span>
        <span class="stat-label">{{ t('followers') }}</span>
      </div>
      <div class="stat-divider"></div>
      <div
        class="stat-item clickable"
        role="button"
        tabindex="0"
        @click="openFollowing"
        @keydown.enter="openFollowing"
      >
        <span class="stat-value">{{ user.interactionsInfo.following.toString() }}</span>
        <span class="stat-label">{{ t('following') }}</span>
      </div>
    </div>
    <p v-if="user.bio" class="user-bio">{{ user.bio }}</p>
    <a
      v-if="user.website"
      :href="user.website"
      target="_blank"
      rel="noopener noreferrer"
      class="user-website"
    >
      <q-icon name="language" size="18px" />
      <span>{{ user.website }}</span>
    </a>

    <UserList
      v-model="showFollowersDialog"
      :load-fn="loadFollowersFn"
      :title="t('followers')"
      :empty-text="t('noFollowers')"
      empty-icon="people_outline"
    />
    <UserList
      v-model="showFollowingDialog"
      :load-fn="loadFollowingFn"
      :title="t('following')"
      :empty-text="t('noFollowing')"
      empty-icon="person_add_alt"
    />
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

  &.clickable {
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      .stat-value,
      .stat-label {
        color: $color-primary;
      }
    }

    &:active {
      transform: scale(0.98);
    }
  }
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
  color: $color-gray-600;

  @include dark-mode {
    color: $color-gray-400;
  }
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
  color: $color-gray-700;

  @media (max-width: $breakpoint-mobile) {
    text-align: center;
  }

  @include dark-mode {
    color: $color-gray-300;
  }
}

.user-website {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: $font-size-sm;
  color: $color-primary;
  text-decoration: none;
  transition: opacity $transition-base;

  @include dark-mode {
    color: $color-primary-light;
  }

  @media (max-width: $breakpoint-mobile) {
    justify-content: center;
  }

  &:hover {
    opacity: 0.8;

    span {
      text-decoration: underline;
    }
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
