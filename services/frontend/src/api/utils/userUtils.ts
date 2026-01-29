import type { User, UserID } from '../types/users'
import { api } from '@/api'
import type { OrganizationReviewsStatistics, UserInteractionsInfo } from '../types/interaction'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

export interface UserLoadResult extends User {
  interactionsInfo?: UserInteractionsInfo
  organizationReviewStatistics?: OrganizationReviewsStatistics
  unreadMessagesCount?: number
}

export const loadUser = async (userId: UserID): Promise<UserLoadResult> => {
  try {
    console.log('Loading user with ID:', userId)
    const user: UserLoadResult = await api.users.getUserById(userId)
    user.interactionsInfo = await getUserInteractionsInfo(userId)
    user.unreadMessagesCount = await loadUnreadMessagesCount(userId)
    if (user.role === 'organization') {
      user.organizationReviewStatistics = await getOrganizationReviewsStatistics(userId)
    }
    console.log('Loaded user:', user)
    return user
  } catch (error) {
    // TODO: maybe return empty user?
    console.error('Failed to load user:', error)
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
  return await api.interactions.getOrganizationReviews(organizationId)
}

const loadUnreadMessagesCount = async (userId: UserID): Promise<number | undefined> => {
  if (authStore.isAuthenticated && authStore.user && authStore.user.id === userId) {
    try {
      const response = await api.chat.unreadMessageCountFor(authStore.user!.id)
      return response.unreadCount
    } catch (error) {
      console.error('Failed to load unread messages count:', error)
      return undefined
    }
  }
  return undefined
}
