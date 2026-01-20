package infrastructure

import com.mongodb.client.MongoCollection
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
import service.UserQueryService
import service.UserService
import sttp.client3.HttpURLConnectionBackend

import java.security.PublicKey
import scala.collection.concurrent.TrieMap

import keycloak._
import Secret.usersServiceSecret
import mongo.MongoConnection._

object Wiring:
  val mediaHost: String    = sys.env.getOrElse("MEDIA_HOST", "localhost") + ":9020"
  val mediaBaseUrl: String = sys.env.getOrElse("MEDIA_BASE_URL", "localhost:9020")
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

  val userService: UserService           = new UserService(memberRepository, organizationRepository)
  val userQueryService: UserQueryService = new UserQueryService(memberRepository, organizationRepository)

  private val kcConnection: KeycloakConnection     = new KeycloakConnection(HttpURLConnectionBackend())
  private val kcTokenService: KeycloakTokenService = new KeycloakTokenService(kcConnection)
  private val usersServiceClientId                 = "users-service"
  private val kcTokenClient: KeycloakTokenClient =
    new KeycloakTokenClient(kcTokenService, usersServiceClientId, usersServiceSecret)
  private val kcAdminApi: KeycloakAdminApi = new KeycloakAdminApi(kcConnection)

  val initializer = new KeycloakRealmInitializer(kcTokenClient, kcAdminApi)
  val roleIds: Map[String, String] = initializer.initializeRoles() match
    case Left(err) =>
      println(s"Failed to initialize member and organization roles: $err")
      sys.error(s"Keycloak roles init failed: $err")
    case Right(ids) =>
      println("Retrieve member and organization roles from Keycloak successfully.")
      ids
  val authService: AuthenticationService = new AuthenticationService(kcTokenClient, kcAdminApi, roleIds)

  val publicKeysCache: TrieMap[String, PublicKey] = TrieMap.empty
