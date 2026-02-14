package domain.service

import domain.query.SearchUsersQuery
import domain.query.UserSearchResult

trait UserQueryService:
  def searchUsers(query: SearchUsersQuery): Either[String, (Seq[UserSearchResult], Boolean)]
