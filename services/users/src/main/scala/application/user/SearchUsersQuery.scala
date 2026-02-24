package application.user

import domain.valueobjects.UserRole

case class SearchUsersQuery(
    role: Option[UserRole],
    prefix: Option[String],
    limit: Int,
    offset: Int
)
