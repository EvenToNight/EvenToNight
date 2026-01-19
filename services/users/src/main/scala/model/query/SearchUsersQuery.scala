package model.query

import model.UserRole

case class SearchUsersQuery(
    role: Option[UserRole],
    prefix: Option[String],
    limit: Int,
    offset: Int
)
