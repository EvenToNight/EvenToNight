import type { User } from '@/api/types/users'

export const mockOrganizations: User[] = [
  {
    id: 'organization_1',
    name: 'Coccorico Events',
    bio: 'Legendary nightclub hosting the best electronic music events in Italy',
    avatarUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3s2TWG_y1cT4NHdiYO0_MBkrI9wGTAIF_QA&s',
    followers: 1200,
    following: 300,
  },
  {
    id: 'organization_2',
    name: 'Riviera Sounds',
    bio: 'Promoter of electronic music events along the Italian Riviera',
    avatarUrl: 'https://www.cdclick.it/gfx/Vinyl/12-BLACK.jpg',
    followers: 800,
    following: 150,
  },
  {
    id: 'organization_3',
    name: 'Italy Music Group',
    bio: 'Leading event organizer for music festivals and club nights in Italy',
    avatarUrl: 'https://cdn.bestmovie.it/wp-content/uploads/2020/11/maradona.jpg',
    followers: 500,
    following: 100,
  },
]
