export type UserID = string
export interface User {
  id: UserID
  name: string
  email: string
  avatarUrl?: string
  bio?: string
  website?: string
  followers: number
  following: number
  role: 'member' | 'organization'
}
