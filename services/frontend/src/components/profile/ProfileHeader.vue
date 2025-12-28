<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/api/types/users'
import type { OrganizationReviewsStatistics } from '@/api/types/interaction'
import RatingInfo from '@/components/reviews/ratings/RatingInfo.vue'
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
import UserInfo from './UserInfo.vue'
import ProfileActions from './ProfileActions.vue'
import { useI18n } from 'vue-i18n'

const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)

interface Props {
  user: User
  isFollowing: boolean
  reviewsStatistics?: OrganizationReviewsStatistics | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isFollowing': [value: boolean]
  editProfile: []
  createEvent: []
  authRequired: []
}>()

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)
const isOwnProfile = computed(() => {
  return authStore.isAuthenticated && authStore.user?.id === props.user.id
})
const isOrganization = computed(() => {
  return props.user.role === 'organization'
})

const defaultIcon = computed(() => {
  return isOrganization.value ? 'business' : 'person'
})

const handleFollowToggle = () => {
  if (!authStore.isAuthenticated) {
    emit('authRequired')
    return
  }
  emit('update:isFollowing', !props.isFollowing)
}

const handleEditProfile = () => {
  emit('editProfile')
}

const handleCreateEvent = () => {
  emit('createEvent')
}
</script>
<template>
  <div class="profile-header-card">
    <div class="profile-header">
      <div class="avatar-container">
        <img
          v-if="user.avatarUrl"
          :src="user.avatarUrl"
          :alt="t('userProfile.userAvatarAlt')"
          class="profile-avatar"
        />
        <q-icon v-else :name="defaultIcon" size="100px" class="profile-avatar" />
      </div>

      <template v-if="isMobile">
        <div class="user-info">
          <h1 class="user-name">{{ user.name }}</h1>
          <UserInfo :user="user" />
          <template v-if="isOrganization && reviewsStatistics">
            <RatingInfo :reviews-statistics="reviewsStatistics" />
          </template>
          <ProfileActions
            :is-own-profile="isOwnProfile"
            :is-organization="isOrganization"
            :is-following="isFollowing"
            @edit-profile="handleEditProfile"
            @create-event="handleCreateEvent"
            @follow-toggle="handleFollowToggle"
          />
        </div>
      </template>

      <template v-else>
        <div class="user-info">
          <div class="name-action-row">
            <h1 class="user-name">{{ user.name }}</h1>
            <ProfileActions
              :is-own-profile="isOwnProfile"
              :is-organization="isOrganization"
              :is-following="isFollowing"
              @edit-profile="handleEditProfile"
              @create-event="handleCreateEvent"
              @follow-toggle="handleFollowToggle"
            />
          </div>
          <template v-if="isOrganization && reviewsStatistics">
            <RatingInfo :reviews-statistics="reviewsStatistics" />
          </template>
          <UserInfo :user="user" />
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-header-card {
  background: $color-white;
  border-radius: $radius-2xl;
  box-shadow: $shadow-base;
  padding: $spacing-6;
  margin: 0 $spacing-6;

  @include dark-mode {
    background: $color-background-dark;
  }
  @media (max-width: $breakpoint-mobile) {
    margin: 0 $spacing-4;
  }
}

.profile-header {
  display: flex;
  align-items: center;
  gap: $spacing-6;

  @media (max-width: $breakpoint-mobile) {
    @include flex-column-center;
    gap: $spacing-4;
  }
}

.avatar-container {
  flex-shrink: 0;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: $shadow-md;
  background: $color-gray-100;

  @media (max-width: $breakpoint-mobile) {
    width: 100px;
    height: 100px;
  }

  @include dark-mode {
    background: $color-background-dark;
  }
}

.user-info {
  @include flex-column;
  flex: 1;
  margin-top: $spacing-2;
  gap: $spacing-1;

  @media (max-width: $breakpoint-mobile) {
    @include flex-center;
    margin-top: 0;
    gap: $spacing-2;
  }
}

.name-action-row {
  @include flex-between;
}

.user-name {
  font-size: $font-size-4xl;
  font-weight: $font-weight-bold;
  margin: 0;
  line-height: 1.2;

  @media (max-width: $breakpoint-mobile) {
    font-size: $font-size-xl;
    text-align: center;
  }
}
</style>
