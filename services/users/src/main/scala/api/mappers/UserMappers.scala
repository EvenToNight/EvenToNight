package api.mappers

import api.dto.response.LoginResponseDTO
import api.dto.response.UserDTO
import model.Member
import model.Organization
import model.RegisteredUser
import model.UserTokens

import AccountMappers.toAccountDTO
import ProfileMappers.toProfileDTO

object UserMappers:
  extension (user: RegisteredUser)
    def toLoginDTO(userId: String, tokens: UserTokens, role: String): LoginResponseDTO =
      user match
        case member: Member =>
          LoginResponseDTO(
            id = userId,
            accessToken = tokens.accessToken,
            expiresIn = tokens.expiresIn,
            refreshToken = tokens.refreshToken,
            refreshExpiresIn = tokens.refreshExpiresIn,
            role = role,
            account = member.account.toAccountDTO,
            profile = member.profile.toProfileDTO
          )
        case org: Organization =>
          LoginResponseDTO(
            id = userId,
            accessToken = tokens.accessToken,
            expiresIn = tokens.expiresIn,
            refreshToken = tokens.refreshToken,
            refreshExpiresIn = tokens.refreshExpiresIn,
            role = role,
            account = org.account.toAccountDTO,
            profile = org.profile.toProfileDTO
          )

    def toUserDTO(userId: String, role: String): UserDTO =
      user match
        case member: Member =>
          UserDTO(
            id = userId,
            role = role,
            username = member.account.username,
            profile = member.profile.toProfileDTO
          )
        case org: Organization =>
          UserDTO(
            id = userId,
            role = role,
            username = org.account.username,
            profile = org.profile.toProfileDTO
          )
