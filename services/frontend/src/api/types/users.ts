export type UserID = string

export type UserRole = 'member' | 'organization'

export interface User {
  id: UserID
  name: string
  username: string
  email: string
  avatar: string
  bio?: string
  website?: string
  role: UserRole
}
