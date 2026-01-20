package model.organization

import api.dto.request.UpdateUserRequestDTO
import model.Organization

object OrganizationUpdate:
  def updateFromDTO(org: Organization, dto: UpdateUserRequestDTO): Organization =
    val newAccount = dto.accountDTO.map(a =>
      org.account.copy(
        username = org.account.username,
        email = org.account.email,
        darkMode = a.darkMode.getOrElse(org.account.darkMode),
        language = a.language.getOrElse(org.account.language),
        interests = a.interests.orElse(org.account.interests)
      )
    ).getOrElse(org.account)

    val newProfile = dto.profileDTO.map(p =>
      org.profile.copy(
        name = p.name.getOrElse(org.profile.name),
        avatar = org.profile.avatar,
        bio = p.bio.orElse(org.profile.bio),
        contacts = p.contacts.orElse(org.profile.contacts)
      )
    ).getOrElse(org.profile)

    org.copy(account = newAccount, profile = newProfile)
