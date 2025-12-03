import type { User } from '@/api/types/users'

export const mockUsers: User[] = [
  {
    id: 'user_1',
    name: 'Alex Johnson',
    bio: 'Music enthusiast and event organizer. Love techno and house music.',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    followers: 234,
    following: 189,
  },
  {
    id: 'user_2',
    name: 'Maria Garcia',
    bio: 'DJ and producer. Spinning records since 2015. Electronic music lover.',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    followers: 567,
    following: 234,
  },
  {
    id: 'user_3',
    name: 'Tom Wilson',
    bio: 'Festival addict. Always on the lookout for the next big event.',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    followers: 123,
    following: 456,
  },
  {
    id: 'user_4',
    name: 'Sophie Martin',
    bio: 'Event photographer capturing the best moments of electronic music culture.',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    followers: 890,
    following: 345,
  },
]
