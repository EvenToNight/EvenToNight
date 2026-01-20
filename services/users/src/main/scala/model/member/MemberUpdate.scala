package model.member

import api.dto.request.UpdateUserRequestDTO
import model.Member

object MemberUpdate:
  def updateFromDTO(member: Member, dto: UpdateUserRequestDTO): Member =
    val newAccount = dto.accountDTO.map(a =>
      member.account.copy(
        username = member.account.username,
        email = member.account.email,
        darkMode = a.darkMode.getOrElse(member.account.darkMode),
        language = a.language.getOrElse(member.account.language),
        gender = a.gender.orElse(member.account.gender),
        birthDate = a.birthDate.orElse(member.account.birthDate),
        interests = a.interests.orElse(member.account.interests)
      )
    ).getOrElse(member.account)

    val newProfile = dto.profileDTO.map(p =>
      member.profile.copy(
        name = p.name.getOrElse(member.profile.name),
        avatar = member.profile.avatar,
        bio = p.bio.orElse(member.profile.bio)
      )
    ).getOrElse(member.profile)

    member.copy(account = newAccount, profile = newProfile)
