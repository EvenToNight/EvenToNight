package integration

import com.mongodb.client.MongoCollection
import com.mongodb.client.MongoDatabase
import com.mongodb.client.model.Filters.{eq => eqFilter}
import fixtures.MemberFixtures.member
import fixtures.OrganizationFixtures.organization
import infrastructure.MongoConnection
import model.member.MemberAccount
import model.member.MemberProfile
import model.organization.OrganizationAccount
import model.organization.OrganizationProfile
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import repository.AccountProfileRepository
import repository.MemberRepository
import repository.MongoAccountProfileRepository
import repository.MongoMemberRepository
import repository.MongoOrganizationRepository
import repository.OrganizationRepository
import service.UserService

class UserServiceSpec extends AnyFlatSpec with Matchers:
  val membersDB: MongoDatabase = MongoConnection.membersDB
  val orgsDB: MongoDatabase    = MongoConnection.organizationsDB

  val memberAccountsColl: MongoCollection[MemberAccount] =
    membersDB.getCollection("member_accounts", classOf[MemberAccount])
  val memberProfilesColl: MongoCollection[MemberProfile] =
    membersDB.getCollection("member_profiles", classOf[MemberProfile])
  val orgAccountsColl: MongoCollection[OrganizationAccount] =
    orgsDB.getCollection("organization_accounts", classOf[OrganizationAccount])
  val orgProfilesColl: MongoCollection[OrganizationProfile] =
    orgsDB.getCollection("organization_profiles", classOf[OrganizationProfile])

  val memberAccountProfileRepo: AccountProfileRepository[MemberAccount, MemberProfile] =
    new MongoAccountProfileRepository(memberAccountsColl, memberProfilesColl)
  val memberRepo: MemberRepository = new MongoMemberRepository(memberAccountProfileRepo)
  val orgAccountProfileRepo: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
    new MongoAccountProfileRepository(orgAccountsColl, orgProfilesColl)
  val orgRepo: OrganizationRepository = new MongoOrganizationRepository(orgAccountProfileRepo)
  val service: UserService            = new UserService(memberRepo, orgRepo)

  "insertUser" should "insert the member account and profile into their respective MongoDB collections" in:
    service.insertUser(member)
    val accountOpt = Option(memberAccountsColl.find(eqFilter("_id", member.account.id)).first())
    accountOpt match
      case Some(accountOpt) => accountOpt.id shouldEqual member.account.id
      case None             => fail("Member account not found in member_accounts collection")
    val profileOpt = Option(memberProfilesColl.find(eqFilter("_id", member.profile.accountId)).first())
    profileOpt match
      case Some(profileOpt) => profileOpt.accountId shouldEqual member.profile.accountId
      case None             => fail("Member profile not found in member_profiles collection")

  "insertUser" should "insert the organization account and profile into their respective MongoDB collections" in:
    service.insertUser(organization)
    val accountOpt = Option(orgAccountsColl.find(eqFilter("_id", organization.account.id)).first())
    accountOpt match
      case Some(accountOpt) => accountOpt.id shouldEqual organization.account.id
      case None             => fail("Organization account not found in organization_accounts collection")
    val profileOpt = Option(orgProfilesColl.find(eqFilter("_id", organization.profile.accountId)).first())
    profileOpt match
      case Some(profileOpt) => profileOpt.accountId shouldEqual organization.profile.accountId
      case None             => fail("Organization profile not found in organization_profiles collection")
