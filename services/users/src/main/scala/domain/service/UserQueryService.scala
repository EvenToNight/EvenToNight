package domain.service

import application.user.SearchUsersQuery
import presentation.http.dto.response.query.UserSearchResultDTO

trait UserQueryService:
  def searchUsers(query: SearchUsersQuery): Either[String, (Seq[UserSearchResultDTO], Boolean)]
