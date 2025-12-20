import type { EventInteraction, EventReview, UserInteraction } from '../../types/interaction'

export const mockEventInteractions: EventInteraction[] = [
  {
    id: '1',
    eventId: '1',
    likes: ['member_1', 'member_2', 'member_3'],
  },
  {
    id: '2',
    eventId: '2',
    likes: ['member_2', 'member_4'],
  },
  {
    id: '3',
    eventId: '3',
    likes: ['member_1', 'member_3', 'organization_1', 'organization_2'],
  },
  {
    id: '4',
    eventId: '4',
    likes: ['member_3', 'organization_3'],
  },
  {
    id: '5',
    eventId: '5',
    likes: ['member_4', 'member_1'],
  },
]

export const mockUserInteractions: UserInteraction[] = [
  {
    id: '1',
    userId: 'member_1',
    followers: ['member_2', 'member_3'],
    following: ['member_2', 'member_3'],
  },
  {
    id: '2',
    userId: 'member_2',
    followers: ['member_1'],
    following: ['member_1'],
  },
  {
    id: '3',
    userId: 'member_3',
    followers: ['member_1', 'member_4'],
    following: ['member_1'],
  },
  {
    id: '4',
    userId: 'member_4',
    followers: ['member_5', 'organization_1'],
    following: ['member_3'],
  },
  {
    id: '5',
    userId: 'organization_1',
    followers: ['organization_2', 'organization_3'],
    following: ['member_4'],
  },
  {
    id: '6',
    userId: 'organization_2',
    followers: ['organization_3'],
    following: ['organization_1'],
  },
  {
    id: '7',
    userId: 'organization_3',
    followers: [],
    following: ['organization_1'],
  },
]

export const mockEventReviews: EventReview[] = [
  {
    id: '1',
    eventId: '1',
    organizationId: 'organization_1',
    collaboratorsId: ['organization_2', 'organization_3'],
    userId: 'member_1',
    rating: 4,
    title: 'Great event title!1',
    comment: 'Great event!1',
  },
  {
    id: '2',
    eventId: '1',
    organizationId: 'organization_1',
    collaboratorsId: ['organization_2', 'organization_3'],
    userId: 'member_2',
    rating: 4,
    title: 'Great event title!2',
    comment: 'Great event!2',
  },
  {
    id: '3',
    eventId: '1',
    organizationId: 'organization_1',
    collaboratorsId: ['organization_2', 'organization_3'],
    userId: 'member_3',
    rating: 2,
    title: 'Great event title!3',
    comment: 'Great event!3',
  },
  {
    id: '4',
    eventId: '1',
    organizationId: 'organization_1',
    collaboratorsId: ['organization_2', 'organization_3'],
    userId: 'member_4',
    rating: 4,
    title: 'Great event title!4',
    comment: 'Great event!4',
  },
]
