import type { Tag } from './events'

export type UserID = string

export type UserRole = 'member' | 'organization'

export type Gender = 'male' | 'female' | 'other'
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

//TODO: website or contacts?
export interface Account {
  darkMode?: boolean //only on own profile
  username: string
  email?: string //only on own profile
  language?: string //only on own profile
  gender?: Gender
  birthDate?: Date
  interests?: Tag[]
}

export interface Profile {
  name: string
  avatar: string
  bio?: string
  website?: string
}

export interface UserInfo {
  userId: UserID
  name: string
  avatar: string
  username: string
}
