import type { Event } from '@/api/types/events'
import {
  event1Location,
  event2Location,
  event3Location,
  event4Location,
  event5Location,
  event6Location,
} from './locations'

export const mockEvents: Event[] = [
  {
    eventId: '1',
    title: 'Techno vibes',
    description:
      'Join us for an unforgettable night of electronic music featuring top DJs from around the world. Experience the best techno vibes in one of the most iconic venues. The night will feature multiple stages with different music styles, from deep house to hard techno.',
    poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    tags: ['Techno', 'Electronic', 'Night Club'],
    location: event1Location,
    date: new Date(2024, 11, 8, 23, 0),
    status: 'COMPLETED',
    creatorId: 'organization_1',
    collaboratorIds: ['organization_2', 'organization_3'],
  },
  {
    eventId: '2',
    title: 'House Music Night',
    description:
      "Experience the finest house music in London's legendary Fabric nightclub. Featuring international DJs and the best sound system in the UK. Get ready for a night of deep grooves and unforgettable beats.",
    poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    tags: ['House', 'Deep House', 'Electronic'],
    location: event2Location,
    date: new Date(2024, 11, 15, 22, 0),
    status: 'PUBLISHED',
    creatorId: 'organization_2',
    collaboratorIds: [],
  },
  {
    eventId: '3',
    title: 'Electronic Dreams',
    description:
      "Step into the legendary Berghain for a night of pure electronic music. One of the world's most famous techno clubs brings you an exceptional lineup of underground artists. Experience techno at its finest.",
    poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    tags: ['Techno', 'Underground', 'Berlin'],
    location: event3Location,
    date: new Date(2024, 11, 22, 0, 0),
    status: 'PUBLISHED',
    creatorId: 'organization_3',
    collaboratorIds: ['organization_1'],
  },
  {
    eventId: '4',
    title: 'Summer Festival 2024',
    description:
      'The biggest summer festival of the year featuring over 50 artists across 5 stages. From sunset to sunrise, enjoy electronic music in a beautiful outdoor setting with camping options available.',
    poster: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    tags: ['Festival', 'Outdoor', 'Multi-stage'],
    location: event4Location,
    date: new Date(2025, 5, 8, 18, 0),
    status: 'PUBLISHED',
    creatorId: 'organization_2',
    collaboratorIds: [],
  },
  {
    eventId: '5',
    title: 'Deep House Sessions',
    description:
      "Immerse yourself in the smooth sounds of deep house at Berlin's Watergate. Located by the river with stunning views, this venue offers an intimate setting for true house music lovers.",
    poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    tags: ['Deep House', 'Berlin', 'Riverside'],
    location: event5Location,
    date: new Date(2024, 11, 28, 23, 30),
    status: 'PUBLISHED',
    creatorId: 'organization_1',
    collaboratorIds: [],
  },
  {
    eventId: '6',
    title: 'Minimal Techno Night',
    description: '',
    poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    tags: [],
    location: event6Location,
    date: new Date(2025, 6, 5, 0, 0),
    status: 'DRAFT',
    creatorId: 'organization_1',
    collaboratorIds: [],
  },
]
