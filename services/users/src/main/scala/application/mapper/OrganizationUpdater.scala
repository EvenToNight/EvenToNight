package application.mapper

import domain.aggregates.Organization
import presentation.http.dto.request.update.UpdateUserRequestDTO

object OrganizationUpdater:
  def updateFromDTO(org: Organization, dto: UpdateUserRequestDTO): Either[String, Organization] =
    val a = dto.accountDTO.get
    val newAccount = org.account.copy(
      username = org.account.username,
      email = org.account.email,
      darkMode = a.darkMode,
      language = a.language,
      interests = a.interests
    )

    val p           = dto.profileDTO.get
    val trimmedName = p.name.trim
    if trimmedName.isEmpty then
      Left("Insert a valid name")
    else
      val newProfile = org.profile.copy(
        name = trimmedName,
        avatar = org.profile.avatar,
        bio = p.bio,
        contacts = p.contacts
      )
      Right(org.copy(account = newAccount, profile = newProfile))
