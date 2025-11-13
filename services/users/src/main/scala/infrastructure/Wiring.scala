package infrastructure

import com.mongodb.client.MongoCollection
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import repository.AccountProfileRepository
import repository.MemberRepository
import repository.MongoAccountProfileRepository
import repository.MongoMemberRepository
import repository.MongoOrganizationRepository
import repository.OrganizationRepository
import service.UserService

import MongoConnection._

object Wiring:
  val memberAccountsColl: MongoCollection[MemberAccount] =
    membersDB.getCollection("member_accounts", classOf[MemberAccount])
  val memberProfilesColl: MongoCollection[MemberProfile] =
    membersDB.getCollection("member_profiles", classOf[MemberProfile])
  val organizationAccountsColl: MongoCollection[OrganizationAccount] =
    organizationsDB.getCollection("organization_accounts", classOf[OrganizationAccount])
  val organizationProfilesColl: MongoCollection[OrganizationProfile] =
    organizationsDB.getCollection("organization_profiles", classOf[OrganizationProfile])

  val memberAccountProfileRepository: AccountProfileRepository[MemberAccount, MemberProfile] =
    new MongoAccountProfileRepository(memberAccountsColl, memberProfilesColl)
  val memberRepository: MemberRepository = new MongoMemberRepository(memberAccountProfileRepository)
  val organizationAccountProfileRepository: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
    new MongoAccountProfileRepository(organizationAccountsColl, organizationProfilesColl)
  val organizationRepository: OrganizationRepository =
    new MongoOrganizationRepository(organizationAccountProfileRepository)

  val userService: UserService = new UserService(memberRepository, organizationRepository)
