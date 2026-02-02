import type { User, UserID } from '../types/users'
import { api } from '@/api'
import type { OrganizationReviewsStatistics, UserInteractionsInfo } from '../types/interaction'
import { useAuthStore } from '@/stores/auth'
import { createLogger } from '@/utils/logger'

const logger = createLogger(import.meta.url)
const authStore = useAuthStore()

export interface UserLoadResult extends User {
  interactionsInfo?: UserInteractionsInfo
  organizationReviewStatistics?: OrganizationReviewsStatistics
}

export const loadUserWithInfo = async (userId: UserID): Promise<UserLoadResult> => {
  try {
    logger.log('Loading user with info with ID:', userId)
    const user: UserLoadResult = await api.users.getUserById(userId)
    user.interactionsInfo = await getUserInteractionsInfo(userId)
    if (user.role === 'organization') {
      user.organizationReviewStatistics = await getOrganizationReviewsStatistics(userId)
    }
    return user
  } catch (error) {
    // TODO: maybe return empty user?
    logger.error('Failed to load user:', error)
    throw error
  }
}

const getUserInteractionsInfo = async (userId: UserID): Promise<UserInteractionsInfo> => {
  const [followers, following] = await Promise.all([
    api.interactions.followers(userId),
    api.interactions.following(userId),
  ])
  const interactionsInfo: UserInteractionsInfo = {
    followers: followers.items.length,
    following: following.items.length,
    isFollowing: false,
  }
  if (authStore.isAuthenticated && authStore.user) {
    if (authStore.user.id === userId) {
      interactionsInfo.isFollowing = undefined
    } else {
      interactionsInfo.isFollowing = await api.interactions.isFollowing(authStore.user.id, userId)
    }
  }
  return interactionsInfo
}

const getOrganizationReviewsStatistics = async (
  organizationId: UserID
): Promise<OrganizationReviewsStatistics> => {
  return await api.interactions.getOrganizationReviewStatistics(organizationId)
}
