import type {
  GetUserInfoResponse,
  GetReviewResponse,
  GetReviewWithStatisticsResponse,
  GetUserLikedEventsResponse,
  InteractionAPI,
} from '../interfaces/interactions'
import type { EventID, OrganizationRole } from '../types/events'
import type {
  EventReview,
  EventReviewData,
  PartecipationInfo,
  UpdateEventReviewData,
  UserPartecipation,
} from '../types/interaction'
import type { UserID } from '../types/users'
import { mockEvents } from './data/events'
import { mockEventInteractions, mockEventReviews, mockUserInteractions } from './data/interactions'
import type { PaginatedRequest, PaginatedResponseWithTotalCount } from '../interfaces/commons'
import { getPaginatedItems } from '@/api/utils/requestUtils'
import type { Rating } from '../types/interaction'
import { mockUsers } from './data/users'

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

  async following(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse> {
    const userInteraction = findUserInteraction(userId)
    const users = userInteraction.following
      .map((followedUserId) => mockUsers.getUserById(followedUserId))
      .filter((user): user is NonNullable<typeof user> => user !== undefined)
      .map((user) => ({
        userId: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      }))
    return {
      ...getPaginatedItems(users, pagination),
      totalItems: users.length,
    }
  },

  async isFollowing(currentUserId: UserID, targetUserId: UserID): Promise<boolean> {
    const currentUserInteraction = findUserInteraction(currentUserId)
    return currentUserInteraction.following.includes(targetUserId)
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

  async followers(userId: UserID, pagination?: PaginatedRequest): Promise<GetUserInfoResponse> {
    const userInteraction = findUserInteraction(userId)
    const users = userInteraction.followers
      .map((followerUserId) => mockUsers.getUserById(followerUserId))
      .filter((user): user is NonNullable<typeof user> => user !== undefined)
      .map((user) => ({
        userId: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      }))
    return {
      ...getPaginatedItems(users, pagination),
      totalItems: users.length,
    }
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

  async userLikesEvent(eventId: EventID, userId: UserID): Promise<boolean> {
    const interaction = findInteractionByEventId(eventId)
    return interaction.likes.includes(userId)
  },

  async getUserReviews(
    userId: UserID,
    params: {
      _search?: string
      pagination?: PaginatedRequest
    }
  ): Promise<GetReviewResponse> {
    //TOODO: use search to filter for event/org name/username
    const reviews = mockEventReviews.filter((review) => review.userId === userId)
    return { ...getPaginatedItems(reviews, params.pagination), totalItems: reviews.length }
  },

  async userReviewForEvent(userId: UserID, eventId: EventID): Promise<EventReview> {
    const review = mockEventReviews.find((r) => r.userId === userId && r.eventId === eventId)
    if (!review) {
      throw {
        message: `Review for event ${eventId} by user ${userId} not found`,
        code: 'REVIEW_NOT_FOUND',
        status: 404,
      }
    }
    return review
  },

  async userParticipations(
    userId: UserID,
    params?: {
      organizationId?: UserID
      reviewed?: boolean
      pagination?: PaginatedRequest
    }
  ): Promise<PaginatedResponseWithTotalCount<UserPartecipation>> {
    //TODO: filter checking user's partecipation to events
    let participations = mockEvents
      .filter((event) => event.status !== 'DRAFT')
      .map((event) => ({
        ...event,
        reviewed: mockEventReviews.some(
          (review) => review.eventId === event.eventId && review.userId === userId
        ),
      }))
    if (params?.organizationId) {
      participations = participations.filter((participation) => {
        return (
          participation?.creatorId === params.organizationId ||
          participation?.collaboratorIds.includes(params.organizationId!)
        )
      })
    }
    if (params?.reviewed) {
      participations = participations.filter(
        (participation) => participation.reviewed === params.reviewed
      )
    }
    return {
      ...getPaginatedItems(participations, params?.pagination),
      totalItems: participations.length,
    }
  },

  async userParticipatedToEvent(userId: UserID, eventId: EventID): Promise<PartecipationInfo> {
    //TODO: check partecipation data
    const hasParticipated = mockEvents.some((event) => event.eventId === eventId)
    const hasReviewed = mockEventReviews.some(
      (review) => review.eventId === eventId && review.userId === userId
    )
    return {
      hasParticipated,
      hasReviewed,
    }
  },

  async likeEvent(eventId: EventID, userId: UserID): Promise<void> {
    const interaction = findInteractionByEventId(eventId)
    if (!interaction.likes.includes(userId)) {
      interaction.likes.push(userId)
    }
  },

  async getEventLikes(
    eventId: EventID,
    pagination?: PaginatedRequest
  ): Promise<GetUserInfoResponse> {
    const likes = findInteractionByEventId(eventId)
      .likes.map((userId) => mockUsers.getUserById(userId))
      .filter((user): user is NonNullable<typeof user> => user !== undefined)
      .map((user) => ({
        userId: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      }))
    return { ...getPaginatedItems(likes, pagination), totalItems: likes.length }
  },

  async unlikeEvent(eventId: EventID, userId: UserID): Promise<void> {
    const interaction = findInteractionByEventId(eventId)
    interaction.likes = interaction.likes.filter((id) => id !== userId)
  },

  async createEventReview(eventId: EventID, review: EventReviewData): Promise<void> {
    if (!mockEvents.find((event) => event.eventId === eventId)) {
      throw {
        message: `Event ${eventId} not found`,
        code: 'EVENT_NOT_FOUND',
        status: 404,
      }
    }
    if (!mockUsers.data.find((user) => user.id === review.userId)) {
      throw {
        message: `User ${review.userId} not found`,
        code: 'USER_NOT_FOUND',
        status: 404,
      }
    }
    return
  },

  async getEventReviews(
    eventId: EventID,
    pagination?: PaginatedRequest
  ): Promise<GetReviewWithStatisticsResponse> {
    const reviews = mockEventReviews.filter((review) => review.eventId === eventId)
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
    params?: {
      role?: OrganizationRole
      pagination?: PaginatedRequest
    }
  ): Promise<GetReviewWithStatisticsResponse> {
    const organizationEvents = mockEvents.filter((event) => event.creatorId === organizationId)
    const eventIds = organizationEvents.map((event) => event.eventId)
    const reviews = mockEventReviews
      .filter((review) => eventIds.includes(review.eventId))
      .filter((review) => {
        if (params?.role === 'creator') {
          return review.creatorId === organizationId
        } else if (params?.role === 'collaborator') {
          return review.collaboratorsId.includes(organizationId)
        }
        return true
      })
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
      ...getPaginatedItems(reviews, params?.pagination),
      totalReviews: reviews.length,
      averageRating,
      ratingDistribution,
    }
  },
}
