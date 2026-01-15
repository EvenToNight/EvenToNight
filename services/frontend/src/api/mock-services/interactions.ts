import type {
  GetUserInfoResponse,
  GetReviewResponse,
  GetReviewWithStatisticsResponse,
  GetUserLikedEventsResponse,
  InteractionAPI,
} from '../interfaces/interactions'
import type { EventID } from '../types/events'
import type { EventReviewData, UpdateEventReviewData } from '../types/interaction'
import type { UserID } from '../types/users'
import { mockEvents } from './data/events'
import { mockUsers } from './data/members'
import { mockEventInteractions, mockEventReviews, mockUserInteractions } from './data/interactions'
import { mockOrganizations } from './data/organizations'
import type { PaginatedRequest } from '../interfaces/commons'
import { getPaginatedItems } from '@/api/utils'
import type { Rating } from '../types/interaction'

const findInteractionByEventId = (eventId: EventID) => {
  const interaction = mockEventInteractions.find((interaction) => interaction.eventId === eventId)

  if (!interaction) {
    throw {
      message: `Interaction for ${eventId} not found`,
      code: 'INTERACTION_NOT_FOUND',
      status: 404,
    }
  }
  return interaction
}

const findUserInteraction = (userId: UserID) => {
  const userInteraction = mockUserInteractions.find((ui) => ui.userId === userId)

  if (!userInteraction) {
    throw {
      message: `User interaction for ${userId} not found`,
      code: 'USER_INTERACTION_NOT_FOUND',
      status: 404,
    }
  }
  return userInteraction
}

export const mockInteractionsApi: InteractionAPI = {
  async getEventLikes(
    eventId: EventID,
    pagination?: PaginatedRequest
  ): Promise<GetUserInfoResponse> {
    const likes = findInteractionByEventId(eventId).likes
    return { ...getPaginatedItems(likes, pagination), totalItems: likes.length }
  },
  async userLikesEvent(eventId: EventID, userId: UserID): Promise<boolean> {
    const interaction = findInteractionByEventId(eventId)
    return interaction.likes.includes(userId)
  },
  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    const interaction = findInteractionByEventId(eventId)
    if (!interaction.likes.includes(userId)) {
      interaction.likes.push(userId)
    }
  },
  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    const interaction = findInteractionByEventId(eventId)
    interaction.likes = interaction.likes.filter((id) => id !== userId)
  },
  async isFollowing(currentUserId: UserID, targetUserId: UserID): Promise<boolean> {
    const currentUserInteraction = findUserInteraction(currentUserId)
    return currentUserInteraction.following.includes(targetUserId)
  },
  async followUser(currentUserId: UserID, targetUserId: UserID): Promise<void> {
    const currentUserInteraction = findUserInteraction(currentUserId)
    const targetUserInteraction = findUserInteraction(targetUserId)

    if (!currentUserInteraction.following.includes(targetUserId)) {
      currentUserInteraction.following.push(targetUserId)
    }
    if (!targetUserInteraction.followers.includes(currentUserId)) {
      targetUserInteraction.followers.push(currentUserId)
    }
  },
  async unfollowUser(currentUserId: UserID, targetUserId: UserID): Promise<void> {
    const currentUserInteraction = findUserInteraction(currentUserId)
    const targetUserInteraction = findUserInteraction(targetUserId)

    currentUserInteraction.following = currentUserInteraction.following.filter(
      (id) => id !== targetUserId
    )
    targetUserInteraction.followers = targetUserInteraction.followers.filter(
      (id) => id !== currentUserId
    )
  },
  async following(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse> {
    const userInteraction = findUserInteraction(userId)
    return {
      ...getPaginatedItems(userInteraction.following, pagination),
      totalItems: userInteraction.following.length,
    }
  },
  async followers(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse> {
    const userInteraction = findUserInteraction(userId)
    return {
      ...getPaginatedItems(userInteraction.followers, pagination),
      totalItems: userInteraction.followers.length,
    }
  },
  async getEventReviews(
    eventId: EventID,
    pagination?: PaginatedRequest
  ): Promise<GetReviewResponse> {
    const reviews = mockEventReviews.filter((review) => review.eventId === eventId)
    return { ...getPaginatedItems(reviews, pagination), totalItems: reviews.length }
  },
  async createEventReview(eventId: EventID, review: EventReviewData): Promise<void> {
    if (!mockEvents.find((event) => event.eventId === eventId)) {
      throw {
        message: `Event ${eventId} not found`,
        code: 'EVENT_NOT_FOUND',
        status: 404,
      }
    }
    if (!mockUsers.find((user) => user.id === review.userId)) {
      throw {
        message: `User ${review.userId} not found`,
        code: 'USER_NOT_FOUND',
        status: 404,
      }
    }
    if (!mockOrganizations.find((org) => org.id === review.creatorId)) {
      throw {
        message: `Organization ${review.creatorId} not found`,
        code: 'ORGANIZATION_NOT_FOUND',
        status: 404,
      }
    }
    for (const collaboratorId of review.collaboratorsId) {
      if (!mockOrganizations.find((org) => org.id === collaboratorId)) {
        throw {
          message: `Collaborator organization ${collaboratorId} not found`,
          code: 'ORGANIZATION_NOT_FOUND',
          status: 404,
        }
      }
    }
    return
  },
  async updateEventReview(
    eventId: EventID,
    userId: UserID,
    review: UpdateEventReviewData
  ): Promise<void> {
    const reviewIndex = mockEventReviews.findIndex(
      (r) => r.eventId === eventId && r.userId === userId
    )
    if (reviewIndex === -1) {
      throw {
        message: `Review for event ${eventId} by user ${userId} not found`,
        code: 'REVIEW_NOT_FOUND',
        status: 404,
      }
    }
    console.log('Updated review:', { eventId, userId, review })
    return
  },
  async getOrganizationReviews(
    organizationId: UserID,
    pagination?: PaginatedRequest
  ): Promise<GetReviewWithStatisticsResponse> {
    const organizationEvents = mockEvents.filter((event) => event.creatorId === organizationId)
    const eventIds = organizationEvents.map((event) => event.eventId)
    const reviews = mockEventReviews.filter((review) => eventIds.includes(review.eventId))
    const averageRating =
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0
    const ratingDistribution: Record<Rating, number> = reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1
        return acc
      },
      {} as Record<Rating, number>
    )

    return {
      ...getPaginatedItems(reviews, pagination),
      totalReviews: reviews.length,
      averageRating,
      ratingDistribution,
    }
  },
  async deleteEventReview(eventId: EventID, userId: UserID): Promise<void> {
    const reviewIndex = mockEventReviews.findIndex(
      (review) => review.eventId === eventId && review.userId === userId
    )
    if (reviewIndex === -1) {
      throw {
        message: `Review for event ${eventId} by user ${userId} not found`,
        code: 'REVIEW_NOT_FOUND',
        status: 404,
      }
    }
    return
  },
  async getUserReviews(userId: UserID, pagination?: PaginatedRequest): Promise<GetReviewResponse> {
    const reviews = mockEventReviews.filter((review) => review.userId === userId)
    return { ...getPaginatedItems(reviews, pagination), totalItems: reviews.length }
  },
  async getUserLikedEvents(
    userId: UserID,
    pagination?: PaginatedRequest
  ): Promise<GetUserLikedEventsResponse> {
    const likedEventIds: EventID[] = mockEventInteractions
      .filter((interaction) => interaction.likes.includes(userId))
      .map((interaction) => interaction.eventId)
    return { ...getPaginatedItems(likedEventIds, pagination), totalItems: likedEventIds.length }
  },
}
