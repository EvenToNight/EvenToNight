<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { api } from '@/api'
import BackButton from '@/components/buttons/actionButtons/BackButton.vue'
import AuthRequiredDialog from '@/components/auth/AuthRequiredDialog.vue'
import type { User } from '@/api/types/users'
import { useNavigation } from '@/router/utils'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileBody from '@/components/profile/ProfileBody.vue'

const { params } = useNavigation()
const isFollowing = ref(false)
const showAuthDialog = ref(false)
const user = ref<User | null>(null)

// Reload when route changes (e.g., navigating between different user profiles)
watch(
  () => params.id,
  () => {
    loadUser()
  }
)

onMounted(async () => {
  await loadUser()
})

const loadUser = async () => {
  try {
    const userId = params.id as string
    const response = await api.users.getUserById(userId)
    user.value = response.user
    // TODO: Load following status from API
    isFollowing.value = false
  } catch (error) {
    console.error('Failed to load user:', error)
    user.value = null
  }
}
</script>

<template>
  <div class="user-profile">
    <BackButton />
    <AuthRequiredDialog v-model:isOpen="showAuthDialog" />
    <template v-if="user">
      <ProfileHeader
        v-model:is-following="isFollowing"
        :user="user"
        @auth-required="showAuthDialog = true"
      />
      <div class="profile-container">
        <ProfileBody :user="user" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.user-profile {
  min-height: 100vh;
  background: var(--q-background);
  position: relative;
  padding-top: calc(#{$spacing-4} + 40px + #{$spacing-4});
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
