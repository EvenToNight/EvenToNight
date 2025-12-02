import type { User, UserID } from '../types/users'

export interface GetUserByIdResponse {
  user: User
}

export interface UsersAPI {
  getUserById(id: UserID): Promise<GetUserByIdResponse>
}
