<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/api/types/users'
import type { UserInteractionsInfo, OrganizationReviewsStatistics } from '@/api/types/interaction'
import RatingInfo from '@/components/reviews/ratings/RatingInfo.vue'
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import breakpoints from '@/assets/styles/abstracts/breakpoints.module.scss'
import UserInfo from './UserInfo.vue'
import ProfileActions from './ProfileActions.vue'
import AvatarCropUpload from '@/components/imageUpload/AvatarCropUpload.vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'

const MOBILE_BREAKPOINT = parseInt(breakpoints.breakpointMobile!)

interface Props {
  reviewsStatistics?: OrganizationReviewsStatistics
}

const user = defineModel<User>({ required: true })
defineProps<Props>()
const isFollowing = ref(false)

const userInteractionsInfo = ref<UserInteractionsInfo>({
  followers: 0,
  following: 0,
})

const emit = defineEmits<{
  authRequired: []
}>()

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()

const avatarCropUploadRef = ref<InstanceType<typeof AvatarCropUpload> | null>(null)
const currentAvatarUrl = ref<string | undefined>(undefined)

const isMobile = computed(() => $q.screen.width <= MOBILE_BREAKPOINT)
const isOwnProfile = computed(() => authStore.isOwnProfile(user.value.id))
const isOrganization = computed(() => {
  return user.value.role === 'organization'
})

const defaultIcon = computed(() => {
  return isOrganization.value ? 'business' : 'person'
})

onMounted(async () => {
  console.log('ProfileHeader mounted for user:', { ...user.value })
  currentAvatarUrl.value = user.value.avatar
  if (authStore.isAuthenticated && !isOwnProfile.value && authStore.user?.id) {
    try {
      isFollowing.value = await api.interactions.isFollowing(authStore.user.id, user.value.id)
    } catch (error) {
      console.error('Failed to load following status:', error)
    }
  }
  const [followers, following] = await Promise.all([
    api.interactions.followers(user.value.id),
    api.interactions.following(user.value.id),
  ])

  const userInteractionsInfoResponse = {
    followers: followers.totalItems,
    following: following.totalItems,
  }
  userInteractionsInfo.value = userInteractionsInfoResponse
})

const handleFollowToggle = async () => {
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    emit('authRequired')
    return
  }

  try {
    if (isFollowing.value) {
      await api.interactions.unfollowUser(authStore.user.id, user.value.id)
      isFollowing.value = false
      userInteractionsInfo.value.followers -= 1
    } else {
      await api.interactions.followUser(authStore.user.id, user.value.id)
      isFollowing.value = true
      userInteractionsInfo.value.followers += 1
    }
  } catch (error) {
    console.error('Failed to toggle follow:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to update follow status',
    })
  }
}

const handleAvatarClick = () => {
  if (isOwnProfile.value) {
    avatarCropUploadRef.value?.triggerFileInput()
  }
}

const handleAvatarError = (message: string) => {
  $q.notify({
    color: 'negative',
    message,
  })
}

const handleAvatarChange = async (file: File | null) => {
  if (!file) return
  URL.revokeObjectURL(currentAvatarUrl.value || '')
  const localPreviewUrl = URL.createObjectURL(file)
  currentAvatarUrl.value = localPreviewUrl

  const updatedUser = await authStore.updateUser({ avatarFile: file })
  user.value.avatar = updatedUser.avatar

  $q.notify({
    color: 'positive',
    message: t('profile.edit.saveSuccess'),
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
        :preview-url="currentAvatarUrl || ''"
        :default-icon="defaultIcon"
        @update:imageFile="handleAvatarChange"
        @error="handleAvatarError"
      />
    </div>

    <div class="profile-header">
      <div class="avatar-container" :class="{ clickable: isOwnProfile }" @click="handleAvatarClick">
        <img
          v-if="currentAvatarUrl"
          :src="currentAvatarUrl"
          :alt="t('userProfile.userAvatarAlt')"
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
          <UserInfo :user="user" :user-interactions-info="userInteractionsInfo" />
          <template v-if="isOrganization && reviewsStatistics">
            <RatingInfo :reviews-statistics="reviewsStatistics" />
          </template>
          <ProfileActions
            :is-own-profile="isOwnProfile"
            :is-organization="isOrganization"
            :is-following="isFollowing"
            :user-id="user.id"
            @follow-toggle="handleFollowToggle"
          />
        </div>
      </template>

      <template v-else>
        <div class="user-info">
          <div class="name-action-row">
            <div class="name-username-container">
              <h1 class="user-name">{{ user.name }}</h1>
              <p class="user-username">@{{ user.username }}</p>
            </div>
            <ProfileActions
              :is-own-profile="isOwnProfile"
              :is-organization="isOrganization"
              :is-following="isFollowing"
              :user-id="user.id"
              @follow-toggle="handleFollowToggle"
            />
          </div>
          <template v-if="isOrganization && reviewsStatistics">
            <RatingInfo :reviews-statistics="reviewsStatistics" />
          </template>
          <UserInfo :user="user" :user-interactions-info="userInteractionsInfo" />
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
