package presentation.http.mappers

import domain.valueobjects.member.MemberAccount
import domain.valueobjects.organization.OrganizationAccount
import presentation.http.dto.response.user.AccountDTO

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
