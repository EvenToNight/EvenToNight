package api.mappers

import api.dto.ProfileDTO
import model.member.MemberProfile
import model.organization.OrganizationProfile

object ProfileMappers:
  extension (profile: MemberProfile)
    def toProfileDTO: ProfileDTO =
      ProfileDTO(
        name = profile.name,
        avatar = profile.avatar,
        bio = profile.bio,
        contacts = None
      )

  extension (profile: OrganizationProfile)
    def toProfileDTO: ProfileDTO =
      ProfileDTO(
        name = profile.name,
        avatar = profile.avatar,
        bio = profile.bio,
        contacts = profile.contacts
      )
