import type { GetUserByIdRequest, GetUserByIdResponse, UsersAPI } from '../interfaces/users'
export const userApi: UsersAPI = {
  async getUserById(_request: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    throw new Error('Not implemented')
  },
}
