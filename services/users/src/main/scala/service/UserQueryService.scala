package service

import model.Member
import model.Organization
import model.RegisteredUser
import model.UserRole._
import model.query.SearchUsersQuery
import model.query.UserSearchAccountResult
import model.query.UserSearchProfileResult
import model.query.UserSearchResult
import repository.MemberRepository
import repository.OrganizationRepository

class UserQueryService(memberRepo: MemberRepository, orgRepo: OrganizationRepository):
  def searchUsers(query: SearchUsersQuery): Either[String, (Seq[UserSearchResult], Boolean)] =
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
