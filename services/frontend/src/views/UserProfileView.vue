<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import { type UserLoadResult, loadUserWithInfo } from '@/api/utils/userUtils'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileBody from '@/components/profile/ProfileBody.vue'
import NavigationButtons from '@/components/navigation/NavigationButtons.vue'
import { NAVBAR_HEIGHT_CSS } from '@/components/navigation/NavigationBar.vue'

const route = useRoute()
const showAuthDialog = ref(false)
const user = ref<UserLoadResult | null>(null)
const profileHeaderRef = ref<HTMLElement | null>(null)
const showNavbarCustomContent = ref(false)
let observer: IntersectionObserver | null = null

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      console.log('Route param changed from', oldId, 'to', newId)
      user.value = await loadUserWithInfo(newId as string)
      scrollToTop()
    }
  }
)

onMounted(async () => {
  user.value = await loadUserWithInfo(route.params.id as string)
  await nextTick() // profileHeaderRef is not set until next tick
  setupScrollObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const setupScrollObserver = async () => {
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

const defaultIcon = computed(() => {
  if (!user.value) return 'person'
  return user.value.role === 'organization' ? 'business' : 'person'
})

const scrollToTop = (behavior: ScrollBehavior = 'auto') => {
  window.scrollTo({ top: 0, behavior })
}
</script>

<template>
  <NavigationButtons>
    <!-- TODO: improve username screen exiting detection -->
    <template v-if="user && showNavbarCustomContent" #left-custom-content>
      <div class="navbar-user-info" @click="() => scrollToTop('smooth')">
        <q-avatar size="32px">
          <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="navbar-avatar" />
          <q-icon v-else :name="defaultIcon" size="24px" />
        </q-avatar>
        <span class="navbar-user-name">@{{ user.username }}</span>
      </div>
    </template>
  </NavigationButtons>

  <div class="user-profile">
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <template v-if="user">
      <div ref="profileHeaderRef">
        <ProfileHeader
          v-model="user"
          :reviews-statistics="user.organizationReviewStatistics"
          @auth-required="showAuthDialog = true"
        />
      </div>
      <div class="profile-container">
        <ProfileBody :user="user" @auth-required="showAuthDialog = true" />
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
  cursor: pointer;

  // &:hover {
  //   text-decoration: underline;
  // }

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
