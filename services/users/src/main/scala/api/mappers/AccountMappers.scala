package api.mappers

import api.dto.response.AccountDTO
import model.member.MemberAccount
import model.organization.OrganizationAccount

object AccountMappers:
  extension (account: MemberAccount)
    def toAccountDTO: AccountDTO =
      AccountDTO(
        username = account.username,
        email = account.email,
        darkMode = account.darkMode,
        language = account.language,
        gender = account.gender,
        birthDate = account.birthDate,
        interests = account.interests
      )

  extension (account: OrganizationAccount)
    def toAccountDTO: AccountDTO =
      AccountDTO(
        username = account.username,
        email = account.email,
        darkMode = account.darkMode,
        language = account.language,
        gender = None,
        birthDate = None,
        interests = account.interests
      )
