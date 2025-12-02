import type { User } from '../types/users'
export interface GetUserByIdRequest {
  userId: string
}
export interface GetUserByIdResponse {
  user: User
}

export interface UsersAPI {
  getUserById(request: GetUserByIdRequest): Promise<GetUserByIdResponse>
}
