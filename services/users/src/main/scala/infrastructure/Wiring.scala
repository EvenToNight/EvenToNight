package infrastructure

import com.mongodb.client.MongoCollection
import infrastructure.Secret.usersServiceSecret
import model.UserReferences
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
import service.AuthenticationService
import service.UserService
import sttp.client3.HttpURLConnectionBackend

import java.security.PublicKey
import scala.collection.concurrent.TrieMap

import MongoConnection._

object Wiring:
  val memberReferencesColl: MongoCollection[UserReferences] =
    membersDB.getCollection("member_references", classOf[UserReferences])
  val organizationReferencesColl: MongoCollection[UserReferences] =
    organizationsDB.getCollection("organization_references", classOf[UserReferences])
  val memberAccountsColl: MongoCollection[MemberAccount] =
    membersDB.getCollection("member_accounts", classOf[MemberAccount])
  val memberProfilesColl: MongoCollection[MemberProfile] =
    membersDB.getCollection("member_profiles", classOf[MemberProfile])
  val organizationAccountsColl: MongoCollection[OrganizationAccount] =
    organizationsDB.getCollection("organization_accounts", classOf[OrganizationAccount])
  val organizationProfilesColl: MongoCollection[OrganizationProfile] =
    organizationsDB.getCollection("organization_profiles", classOf[OrganizationProfile])

  val memberAccountProfileRepository: AccountProfileRepository[MemberAccount, MemberProfile] =
    new MongoAccountProfileRepository(memberReferencesColl, memberAccountsColl, memberProfilesColl)
  val memberRepository: MemberRepository = new MongoMemberRepository(memberAccountProfileRepository)
  val organizationAccountProfileRepository: AccountProfileRepository[OrganizationAccount, OrganizationProfile] =
    new MongoAccountProfileRepository(organizationReferencesColl, organizationAccountsColl, organizationProfilesColl)
  val organizationRepository: OrganizationRepository =
    new MongoOrganizationRepository(organizationAccountProfileRepository)

  val userService: UserService = new UserService(memberRepository, organizationRepository)

  val kc          = new KeycloakConnection(HttpURLConnectionBackend(), usersServiceSecret)
  val authService = new AuthenticationService(kc)

  val publicKeysCache: TrieMap[String, PublicKey] = TrieMap.empty
