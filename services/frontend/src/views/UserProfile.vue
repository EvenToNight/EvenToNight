<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import OrganizationProfile from '@/components/profile/OrganizationProfile.vue'
import MemberProfile from '@/components/profile/MemberProfile.vue'

const route = useRoute()
const userRole = ref<'member' | 'organization' | null>(null)

const loadUserRole = async () => {
  try {
    const userId = route.params.id as string
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
  () => route.params.id,
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
