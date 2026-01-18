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
    def toLoginDTO(tokens: UserTokens, role: String): LoginResponseDTO =
      user match
        case member: Member =>
          LoginResponseDTO(
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
            accessToken = tokens.accessToken,
            expiresIn = tokens.expiresIn,
            refreshToken = tokens.refreshToken,
            refreshExpiresIn = tokens.refreshExpiresIn,
            role = role,
            account = org.account.toAccountDTO,
            profile = org.profile.toProfileDTO
          )

    def toUserDTO(role: String): UserDTO =
      user match
        case member: Member =>
          UserDTO(
            role = role,
            username = member.account.username,
            profile = member.profile.toProfileDTO
          )
        case org: Organization =>
          UserDTO(
            role = role,
            username = org.account.username,
            profile = org.profile.toProfileDTO
          )
