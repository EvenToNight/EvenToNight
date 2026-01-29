import { computed, type ComputedRef, type Ref } from 'vue'
import type { UserRole } from '@/api/types/users'
import type { UserLoadResult } from '@/api/utils/userUtils'
import { useAuthStore } from '@/stores/auth'

export interface UseUserProfileReturn {
  isOwnProfile: ComputedRef<boolean | undefined>
  isOrganization: ComputedRef<boolean | undefined>
  isMember: ComputedRef<boolean | undefined>
  defaultIcon: ComputedRef<string | undefined>
  userRole: ComputedRef<UserRole | undefined>
}

export function useUserProfile(user: Ref<UserLoadResult | undefined>): UseUserProfileReturn {
  const authStore = useAuthStore()

  const isOwnProfile = computed(() => {
    return user.value ? authStore.isOwnProfile(user.value.id) : undefined
  })

  const isOrganization = computed(() => {
    return user.value ? user.value.role === 'organization' : undefined
  })

  const isMember = computed(() => {
    return user.value ? user.value.role === 'member' : undefined
  })

  const defaultIcon = computed(() => {
    return isOrganization.value ? 'business' : isMember.value ? 'person' : undefined
  })

  const userRole = computed(() => {
    return user.value ? user.value.role : undefined
  })

  return {
    isOwnProfile,
    isOrganization,
    isMember,
    defaultIcon,
    userRole,
  }
}
