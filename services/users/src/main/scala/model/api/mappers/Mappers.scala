package model.api.mappers

import model.Member
import model.Organization
import model.RegisteredUser
import model.UserTokens
import model.api.dto.AccountDTO
import model.api.dto.LoginResponseDTO
import model.api.dto.ProfileDTO
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile

object Mappers:
  extension (account: MemberAccount)
    def toAccountDTO: AccountDTO =
      AccountDTO(
        username = account.username,
        email = account.email
      )

  extension (account: OrganizationAccount)
    def toAccountDTO: AccountDTO =
      AccountDTO(
        username = account.username,
        email = account.email
      )

  extension (profile: MemberProfile)
    def toProfileDTO: ProfileDTO =
      ProfileDTO(
        name = profile.name
      )

  extension (profile: OrganizationProfile)
    def toProfileDTO: ProfileDTO =
      ProfileDTO(
        name = profile.name
      )

  extension (user: RegisteredUser)
    def toLoginDTO(tokens: UserTokens): LoginResponseDTO =
      user match
        case member: Member =>
          LoginResponseDTO(
            accessToken = tokens.accessToken,
            expiresIn = tokens.expiresIn,
            refreshToken = tokens.refreshToken,
            refreshExpiresIn = tokens.refreshExpiresIn,
            account = member.account.toAccountDTO,
            profile = member.profile.toProfileDTO
          )
        case org: Organization =>
          LoginResponseDTO(
            accessToken = tokens.accessToken,
            expiresIn = tokens.expiresIn,
            refreshToken = tokens.refreshToken,
            refreshExpiresIn = tokens.refreshExpiresIn,
            account = org.account.toAccountDTO,
            profile = org.profile.toProfileDTO
          )
