package api.mappers

import api.dto.AccountDTO
import model.member.MemberAccount
import model.organization.OrganizationAccount

object AccountMappers:
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
