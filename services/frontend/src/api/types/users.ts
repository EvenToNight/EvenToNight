import type { Tag } from './events'

export type UserID = string

export type UserRole = 'member' | 'organization'

// export interface User {
//   id: UserID
//   name: string
//   username: string
//   email: string
//   avatar: string
//   bio?: string
//   website?: string
//   role: UserRole
// }

export type User = Account &
  Profile & {
    id: UserID
    role: UserRole
  }

//TODO: update, missing id, website or contacts?
export interface Account {
  darkMode?: boolean //only on own profile
  username: string
  email?: string //only on own profile
  language?: string //only on own profile
  gender?: string
  birthDate?: Date
  interests?: Tag[]
}

export interface Profile {
  name: string
  avatar: string
  bio?: string
  website?: string
}
