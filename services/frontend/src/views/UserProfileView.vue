<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { api } from '@/api'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import type { User } from '@/api/types/users'
import type { OrganizationReviewsStatistics } from '@/api/types/interaction'
import { useNavigation } from '@/router/utils'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileBody from '@/components/profile/ProfileBody.vue'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'

const { params } = useNavigation()
const isFollowing = ref(false)
const showAuthDialog = ref(false)
const user = ref<User | null>(null)
const reviewsStatistics = ref<OrganizationReviewsStatistics | null>(null)
const profileHeaderRef = ref<HTMLElement | null>(null)
const showNavbarCustomContent = ref(false)
let observer: IntersectionObserver | null = null

onMounted(async () => {
  await loadUser()
  setupScrollObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const setupScrollObserver = async () => {
  // Wait for next tick to ensure DOM is ready
  await nextTick()
  if (!profileHeaderRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        showNavbarCustomContent.value = !entry.isIntersecting
      })
    },
    {
      threshold: 0,
      rootMargin: `-${NAVBAR_HEIGHT_CSS} 0px 0px 0px`,
    }
  )
  observer.observe(profileHeaderRef.value)
}

const loadUser = async () => {
  try {
    const userId = params.id as string
    user.value = await api.users.getUserById(userId)
    // TODO: Load following status from API
    isFollowing.value = false

    // Load reviews statistics if organization
    if (user.value.role === 'organization') {
      try {
        const reviews = await api.interactions.getOrganizationReviews(userId)
        reviewsStatistics.value = {
          averageRating: reviews.averageRating,
          totalReviews: reviews.totalReviews,
          ratingDistribution: reviews.ratingDistribution,
        }
        console.log('Reviews statistics:', reviewsStatistics.value)
      } catch (error) {
        console.error('Failed to load organization reviews:', error)
      }
    }
  } catch (error) {
    console.error('Failed to load user:', error)
    user.value = null
  }
}

const defaultIcon = computed(() => {
  if (!user.value) return 'person'
  return user.value.role === 'organization' ? 'business' : 'person'
})
</script>

<template>
  <NavigationButtons>
    <template v-if="user && showNavbarCustomContent" #left-custom-content>
      <div class="navbar-user-info">
        <q-avatar size="32px">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.name" class="navbar-avatar" />
          <q-icon v-else :name="defaultIcon" size="24px" />
        </q-avatar>
        <span class="navbar-user-name">{{ user.name }}</span>
      </div>
    </template>
  </NavigationButtons>

  <div class="user-profile">
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <template v-if="user">
      <div ref="profileHeaderRef">
        <ProfileHeader
          v-model:is-following="isFollowing"
          :user="user"
          :reviews-statistics="reviewsStatistics"
          @auth-required="showAuthDialog = true"
        />
      </div>
      <div class="profile-container">
        <ProfileBody :user="user" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.navbar-user-info {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  min-width: 0;
  flex: 1;
  color: $color-text-primary;

  @include dark-mode {
    color: $color-text-dark;
  }
}

.navbar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.navbar-user-name {
  @include text-truncate;
  font-weight: $font-weight-semibold;
  font-size: $font-size-base;
}

.user-profile {
  min-height: 100vh;
  background: var(--q-background);
  position: relative;
  margin-top: calc(-1 * v-bind(NAVBAR_HEIGHT_CSS));
  padding-top: calc(v-bind(NAVBAR_HEIGHT_CSS) + #{$spacing-6});

  background: #f5f5f5;

  @include dark-mode {
    background: #121212;
  }
}

.profile-container {
  margin: 0 auto;
  padding: 0 $spacing-6 $spacing-8;
  position: relative;
  margin-top: $spacing-6;
  @media (max-width: $breakpoint-mobile) {
    padding: 0 $spacing-4 $spacing-6;
  }
}
</style>
