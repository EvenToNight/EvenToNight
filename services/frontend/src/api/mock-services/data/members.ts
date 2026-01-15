import type { User } from '@/api/types/users'

export const mockUsers: User[] = [
  {
    id: 'member_1',
    name: 'Alex Johnson',
    email: 'member_1@example.com',
    bio: 'Music enthusiast and event organizer. Love techno and house music.',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    role: 'member',
  },
  {
    id: 'member_2',
    name: 'Maria Garcia',
    email: 'member_2@example.com',
    bio: 'DJ and producer. Spinning records since 2015. Electronic music lover.',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    role: 'member',
  },
  {
    id: 'member_3',
    name: 'Tom Wilson',
    email: 'member_3@example.com',
    bio: 'Festival addict. Always on the lookout for the next big event.',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    role: 'member',
  },
  {
    id: 'member_4',
    name: 'Sophie Martin',
    email: 'member_4@example.com',
    bio: 'Event photographer capturing the best moments of electronic music culture.',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    role: 'member',
  },
]
