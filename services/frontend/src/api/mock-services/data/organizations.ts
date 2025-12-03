import type { User } from '@/api/types/users'

export const mockOrganizations: User[] = [
  {
    id: 'organization_1',
    name: 'Coccorico Events',
    email: 'organization_1@example.com',
    bio: 'Legendary nightclub hosting the best electronic music events in Italy',
    avatarUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3s2TWG_y1cT4NHdiYO0_MBkrI9wGTAIF_QA&s',
    followers: 1200,
    following: 300,
    role: 'organization',
  },
  {
    id: 'organization_2',
    name: 'Riviera Sounds',
    email: 'organization_2@example.com',
    bio: 'Promoter of electronic music events along the Italian Riviera',
    avatarUrl: 'https://www.cdclick.it/gfx/Vinyl/12-BLACK.jpg',
    followers: 800,
    following: 150,
    role: 'organization',
  },
  {
    id: 'organization_3',
    name: 'Italy Music Group',
    email: 'organization_3@example.com',
    bio: 'Leading event organizer for music festivals and club nights in Italy',
    avatarUrl: 'https://cdn.bestmovie.it/wp-content/uploads/2020/11/maradona.jpg',
    followers: 500,
    following: 100,
    role: 'organization',
  },
]
