package domain.query

import domain.UserRole

case class SearchUsersQuery(
    role: Option[UserRole],
    prefix: Option[String],
    limit: Int,
    offset: Int
)
