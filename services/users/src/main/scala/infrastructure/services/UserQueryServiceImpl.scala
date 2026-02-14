package infrastructure.services

import domain.UserRole._
import domain.aggregates.Member
import domain.aggregates.Organization
import domain.aggregates.RegisteredUser
import domain.query.SearchUsersQuery
import domain.query.UserSearchAccountResult
import domain.query.UserSearchProfileResult
import domain.query.UserSearchResult
import domain.repository.MemberRepository
import domain.repository.OrganizationRepository
import domain.service.UserQueryService

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
            val memberAccount = UserSearchAccountResult(m.account.username)
            val memberProfile = UserSearchProfileResult(m.profile.name, m.profile.avatar, m.profile.bio)
            UserSearchResult(userId, MemberRole, memberAccount, memberProfile)
          case o: Organization =>
            val organizationAccount = UserSearchAccountResult(o.account.username)
            val organizationProfile = UserSearchProfileResult(o.profile.name, o.profile.avatar, o.profile.bio)
            UserSearchResult(userId, OrganizationRole, organizationAccount, organizationProfile)
      }

      val hasMore = allUsers.size > query.limit + query.offset
      Right((results, hasMore))
    catch
      case ex: Exception => Left(s"Error searching users: ${ex.getMessage}")
