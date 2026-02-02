<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import RatingInfo from '@/components/reviews/ratings/RatingInfo.vue'
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import UserInfo from './UserInfo.vue'
import ProfileActions from './ProfileActions.vue'
import AvatarCropUpload from '@/components/imageUpload/AvatarCropUpload.vue'
import { api } from '@/api'
import type { UserLoadResult } from '@/api/utils/userUtils'
import { useUserProfile } from '@/composables/useUserProfile'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useTranslation } from '@/composables/useTranslation'
import { createLogger } from '@/utils/logger'

const user = defineModel<UserLoadResult>({ required: true })
const emit = defineEmits<{
  authRequired: []
}>()

const $q = useQuasar()
const { t } = useTranslation('components.profile.ProfileHeader')
const logger = createLogger(import.meta.url)
const authStore = useAuthStore()
const { isOwnProfile, isOrganization, defaultIcon } = useUserProfile(user)
const { isMobile } = useBreakpoints()
const isFollowing = computed(() => user.value.interactionsInfo?.isFollowing)

const avatarCropUploadRef = ref<InstanceType<typeof AvatarCropUpload> | null>(null)

const handleFollowToggle = async () => {
  if (isOwnProfile.value) return
  if (!authStore.isAuthenticated) {
    emit('authRequired')
    return
  }

  try {
    if (isFollowing.value) {
      await api.interactions.unfollowUser(authStore.user!.id, user.value.id)
      user.value.interactionsInfo!.isFollowing = false
      user.value.interactionsInfo!.followers -= 1
    } else {
      await api.interactions.followUser(authStore.user!.id, user.value.id)
      user.value.interactionsInfo!.isFollowing = true
      user.value.interactionsInfo!.followers += 1
    }
  } catch (error) {
    logger.error('Failed to toggle follow status:', error)
    $q.notify({
      type: 'negative',
      message: t('followError'),
    })
  }
}

const handleAvatarClick = () => {
  if (isOwnProfile.value) {
    avatarCropUploadRef.value?.triggerFileInput()
  }
}

const handleAvatarError = (message: string) => {
  logger.error('Avatar upload error:', message)
  $q.notify({
    color: 'negative',
    message: t('uploadAvatarError'),
  })
}

const handleAvatarChange = async (file: File | null) => {
  if (!file) return
  URL.revokeObjectURL(user.value.avatar || '')
  const localPreviewUrl = URL.createObjectURL(file)
  user.value.avatar = localPreviewUrl

  const updatedUser = await authStore.updateUser({ avatarFile: file })
  user.value.avatar = updatedUser.avatar

  $q.notify({
    color: 'positive',
    message: t('profileUpdate'),
    icon: 'check_circle',
  })
}
</script>
<template>
  <div class="profile-header-card">
    <!-- Hidden avatar upload component -->
    <div v-if="isOwnProfile" style="display: none">
      <AvatarCropUpload
        ref="avatarCropUploadRef"
        :preview-url="user.avatar"
        :default-icon="defaultIcon"
        @imageFile="handleAvatarChange"
        @error="handleAvatarError"
      />
    </div>

    <div class="profile-header">
      <div
        class="avatar-container"
        :class="{ clickable: isOwnProfile }"
        role="button"
        tabindex="0"
        @click="handleAvatarClick"
        @keydown.enter="handleAvatarClick"
      >
        <img
          v-if="user.avatar"
          :src="user.avatar"
          :alt="t('userAvatarAlt')"
          class="profile-avatar"
        />
        <q-icon v-else :name="defaultIcon" size="100px" class="profile-avatar" />
        <div v-if="isOwnProfile" class="avatar-edit-overlay">
          <q-icon name="photo_camera" size="32px" color="white" />
        </div>
      </div>

      <template v-if="isMobile">
        <div class="user-info">
          <div class="name-username-container">
            <h1 class="user-name">{{ user.name }}</h1>
            <p class="user-username">@{{ user.username }}</p>
          </div>
          <UserInfo :user="user" />
          <template v-if="user.organizationReviewStatistics">
            <RatingInfo :reviews-statistics="user.organizationReviewStatistics" />
          </template>
          <ProfileActions :user="user" @follow-toggle="handleFollowToggle" />
        </div>
      </template>

      <template v-else>
        <div class="user-info">
          <div class="name-action-row">
            <div class="name-username-container">
              <h1 class="user-name">{{ user.name }}</h1>
              <p class="user-username">@{{ user.username }}</p>
            </div>
            <ProfileActions :user="user" @follow-toggle="handleFollowToggle" />
          </div>
          <template v-if="isOrganization && user.organizationReviewStatistics">
            <RatingInfo :reviews-statistics="user.organizationReviewStatistics" />
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
  position: relative;

  &.clickable {
    cursor: pointer;
    transition: transform $transition-base;

    &:hover {
      transform: scale(1.05);

      .avatar-edit-overlay {
        opacity: 1;
      }
    }
  }
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

.avatar-edit-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba($color-black, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity $transition-base;
  pointer-events: none;
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

.name-username-container {
  @include flex-column;
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

.user-username {
  font-size: $font-size-base;
  color: $color-gray-600;
  margin: $spacing-1 0 0 0;
  font-weight: $font-weight-normal;

  @include dark-mode {
    color: $color-gray-400;
  }

  @media (max-width: $breakpoint-mobile) {
    text-align: center;
  }
}
</style>
