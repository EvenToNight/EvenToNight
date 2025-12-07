<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { api } from '@/api'
import OrganizationProfile from '@/components/profile/OrganizationProfile.vue'
import MemberProfile from '@/components/profile/MemberProfile.vue'
import { useNavigation } from '@/router/utils'

const { params } = useNavigation()
const userRole = ref<'member' | 'organization' | null>(null)

const loadUserRole = async () => {
  try {
    const userId = params.id as string
    const response = await api.users.getUserById(userId)
    userRole.value = response.user.role
  } catch (error) {
    console.error('Failed to load user role:', error)
    userRole.value = null
  }
}

onMounted(() => {
  loadUserRole()
})

// Reload when route changes (e.g., navigating between different user profiles)
watch(
  () => params.id,
  () => {
    loadUserRole()
  }
)
</script>

<template>
  <div v-if="userRole">
    <MemberProfile v-if="userRole === 'member'" />
    <OrganizationProfile v-else />
  </div>
</template>
