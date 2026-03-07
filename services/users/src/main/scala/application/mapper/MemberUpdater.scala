package application.mapper

import domain.aggregates.Member
import presentation.http.dto.request.update.UpdateUserRequestDTO

object MemberUpdater:
  def updateFromDTO(member: Member, dto: UpdateUserRequestDTO): Either[String, Member] =
    val a = dto.accountDTO.get
    val newAccount = member.account.copy(
      username = member.account.username,
      email = member.account.email,
      darkMode = a.darkMode,
      language = a.language,
      gender = a.gender,
      birthDate = a.birthDate,
      interests = a.interests
    )

    val p           = dto.profileDTO.get
    val trimmedName = p.name.trim
    if trimmedName.isEmpty then
      Left("Insert a valid name")
    else
      val newProfile = member.profile.copy(
        name = trimmedName,
        avatar = member.profile.avatar,
        bio = p.bio
      )
      Right(member.copy(account = newAccount, profile = newProfile))
