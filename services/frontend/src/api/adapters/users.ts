import type {
  LoginAPIResponse,
  LoginResponse,
  ProfileAPIResponse,
  UserAPIResponse,
} from '../interfaces/users'
import type { Profile, User, UserID } from '../types/users'
import { jwtDecode } from 'jwt-decode'

function adaptProfile(dto: ProfileAPIResponse): Profile {
  return {
    name: dto.name,
    avatar: dto.avatar,
    bio: dto.bio,
    website:
      Array.isArray(dto.constacts) && dto.constacts.length > 0 ? dto.constacts[0] : undefined,
  }
}

export const LoginAdapter = {
  fromApi(dto: LoginAPIResponse): LoginResponse {
    const decoded: { user_id: string } = jwtDecode(dto.accessToken)
    const user: User = {
      ...dto.account,
      ...adaptProfile(dto.profile),
      id: decoded.user_id,
      role: dto.role,
    }
    return {
      accessToken: dto.accessToken,
      expiresIn: dto.expiresIn,
      refreshToken: dto.refreshToken,
      refreshExpiresIn: dto.refreshExpiresIn,
      user,
    }
  },
}

export const UserAdapter = {
  fromApi(userId: UserID, dto: UserAPIResponse): User {
    return {
      id: userId,
      role: dto.role,
      username: dto.username,
      ...adaptProfile(dto.profile),
    }
  },
}
