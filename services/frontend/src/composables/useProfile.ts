import { computed, type ComputedRef, type Ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UserID } from '@/api/types/users'

/**
 * Check if the given user ID matches the currently authenticated user
 * @param userId - The user ID to check (can be a string, ref, computed ref, or getter function)
 * @returns A computed boolean indicating if this is the current user's profile
 */
export function useIsOwnProfile(
  userId: UserID | Ref<UserID> | ComputedRef<UserID> | (() => UserID)
): ComputedRef<boolean> {
  const authStore = useAuthStore()

  // Normalize the input to a computed ref
  const userIdRef =
    typeof userId === 'function'
      ? computed(userId)
      : typeof userId === 'string'
        ? computed(() => userId)
        : userId

  return computed(() => {
    return authStore.isAuthenticated && authStore.user?.id === userIdRef.value
  })
}
