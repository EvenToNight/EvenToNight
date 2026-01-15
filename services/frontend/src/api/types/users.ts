export type UserID = string

export type UserRole = 'member' | 'organization'

export interface User {
  id: UserID
  name: string
  email: string
  avatarUrl?: string
  bio?: string
  website?: string
  role: UserRole
}
