import type { User } from '@/api/types/users'

const mockMembers = [
  {
    id: 'member_1',
    name: 'Alex Johnson',
    username: 'member_1',
    email: 'member_1@example.com',
    bio: 'Music enthusiast and event organizer. Love techno and house music.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'member',
  },
  {
    id: 'member_2',
    name: 'Maria Garcia',
    username: 'member_2',
    email: 'member_2@example.com',
    bio: 'DJ and producer. Spinning records since 2015. Electronic music lover.',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'member',
  },
  {
    id: 'member_3',
    name: 'Tom Wilson',
    username: 'member_3',
    email: 'member_3@example.com',
    bio: 'Festival addict. Always on the lookout for the next big event.',
    avatar: 'https://i.pravatar.cc/150?img=12',
    role: 'member',
  },
  {
    id: 'member_4',
    name: 'Sophie Martin',
    username: 'member_4',
    email: 'member_4@example.com',
    bio: 'Event photographer capturing the best moments of electronic music culture.',
    avatar: 'https://i.pravatar.cc/150?img=9',
    role: 'member',
  },
] as const satisfies readonly User[]

const mockOrganizations = [
  {
    id: 'organization_1',
    name: 'Coccorico Events',
    username: 'organization_1',
    email: 'organization_1@example.com',
    bio: 'Legendary nightclub hosting the best electronic music events in Italy',
    avatar:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3s2TWG_y1cT4NHdiYO0_MBkrI9wGTAIF_QA&s',
    role: 'organization',
  },
  {
    id: 'organization_2',
    name: 'Riviera Sounds',
    username: 'organization_2',
    email: 'organization_2@example.com',
    bio: 'Promoter of electronic music events along the Italian Riviera',
    avatar: 'https://www.cdclick.it/gfx/Vinyl/12-BLACK.jpg',
    role: 'organization',
  },
  {
    id: 'organization_3',
    name: 'Italy Music Group',
    username: 'organization_3',
    email: 'organization_3@example.com',
    bio: 'Leading event organizer for music festivals and club nights in Italy',
    avatar: 'https://cdn.bestmovie.it/wp-content/uploads/2020/11/maradona.jpg',
    role: 'organization',
  },
  {
    id: 'organization_40',
    name: 'Org40',
    username: 'organization_40',
    email: 'organization_40@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_41',
    name: 'Org41',
    username: 'organization_41',
    email: 'organization_41@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_42',
    name: 'Org42',
    username: 'organization_42',
    email: 'organization_42@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_43',
    name: 'Org43',
    username: 'organization_43',
    email: 'organization_43@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_44',
    name: 'Org44',
    username: 'organization_44',
    email: 'organization_44@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_45',
    name: 'Org45',
    username: 'organization_45',
    email: 'organization_45@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_46',
    name: 'Org46',
    username: 'organization_46',
    email: 'organization_46@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_47',
    name: 'Org47',
    username: 'organization_47',
    email: 'organization_47@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_48',
    name: 'Org48',
    username: 'organization_48',
    email: 'organization_48@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_49',
    name: 'Org49',
    username: 'organization_49',
    email: 'organization_49@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
  {
    id: 'organization_50',
    name: 'Org50',
    username: 'organization_50',
    email: 'organization_50@example.com',
    bio: 'bio',
    avatar: 'https://i.pravatar.cc/150?img=7',
    role: 'organization',
  },
] as const satisfies readonly User[]

export const mockUsers = {
  data: [...mockMembers, ...mockOrganizations],

  organizations: function () {
    return this.data.filter((u) => u.role === 'organization')
  },

  members: function () {
    return this.data.filter((u) => u.role === 'member')
  },

  getUserById: function (id: string): User {
    const user = this.data.find((u) => u.id === id)
    if (!user) {
      throw {
        message: 'User not found',
        status: 404,
      }
    }
    return user
  },
}
