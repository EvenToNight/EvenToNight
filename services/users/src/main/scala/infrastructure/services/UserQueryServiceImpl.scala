package infrastructure.services

import application.user.SearchUsersQuery
import domain.aggregates.Member
import domain.aggregates.Organization
import domain.aggregates.RegisteredUser
import domain.repository.MemberRepository
import domain.repository.OrganizationRepository
import domain.service.UserQueryService
import domain.valueobjects.UserRole._
import presentation.http.dto.response.query.UserSearchAccountResultDTO
import presentation.http.dto.response.query.UserSearchProfileResultDTO
import presentation.http.dto.response.query.UserSearchResultDTO

class UserQueryServiceImpl(memberRepo: MemberRepository, orgRepo: OrganizationRepository) extends UserQueryService:
  override def searchUsers(query: SearchUsersQuery) =
    try
      val members       = memberRepo.search(query.prefix, query.limit + query.offset)
      val organizations = orgRepo.search(query.prefix, query.limit + query.offset)

      val allUsers: Seq[(String, RegisteredUser)] = query.role match
        case Some(MemberRole)       => members
        case Some(OrganizationRole) => organizations
        case None                   => members ++ organizations

      val pagedUsers = allUsers.slice(query.offset, query.offset + query.limit)

      val results = pagedUsers.map { case (userId, user) =>
        user match
          case m: Member =>
            val memberAccount = UserSearchAccountResultDTO(m.account.username)
            val memberProfile = UserSearchProfileResultDTO(m.profile.name, m.profile.avatar, m.profile.bio)
            UserSearchResultDTO(userId, MemberRole, memberAccount, memberProfile)
          case o: Organization =>
            val organizationAccount = UserSearchAccountResultDTO(o.account.username)
            val organizationProfile = UserSearchProfileResultDTO(o.profile.name, o.profile.avatar, o.profile.bio)
            UserSearchResultDTO(userId, OrganizationRole, organizationAccount, organizationProfile)
      }

      val hasMore = allUsers.size > query.limit + query.offset
      Right((results, hasMore))
    catch
      case ex: Exception => Left(s"Error searching users: ${ex.getMessage}")
