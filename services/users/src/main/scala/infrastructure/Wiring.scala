package infrastructure

import com.mongodb.client.MongoCollection
import domain.repository.MemberRepository
import domain.repository.OrganizationRepository
import domain.service.AuthenticationService
import domain.service.MediaService
import domain.service.UserQueryService
import domain.service.UserService
import infrastructure.media.MediaServiceClient
import infrastructure.persistence.mongo.models.member.MemberDocument
import infrastructure.persistence.mongo.models.organization.OrganizationDocument
import infrastructure.persistence.mongo.repositories.MongoMemberRepository
import infrastructure.persistence.mongo.repositories.MongoOrganizationRepository
import infrastructure.services.KeycloakAuthenticationService
import infrastructure.services.UserQueryServiceImpl
import infrastructure.services.UserServiceImpl
import sttp.client3.HttpURLConnectionBackend

import java.security.PublicKey
import scala.collection.concurrent.TrieMap

import keycloak._
import Secret.usersServiceSecret
import persistence.mongo.MongoConnection._

object Wiring:
  val mediaHost: String    = sys.env.getOrElse("MEDIA_HOST", "localhost") + ":9020"
  val mediaBaseUrl: String = sys.env.getOrElse("MEDIA_BASE_URL", "localhost:9020")
  val membersColl: MongoCollection[MemberDocument] =
    usersDB.getCollection("members", classOf[MemberDocument])
  val organizationsColl: MongoCollection[OrganizationDocument] =
    usersDB.getCollection("organizations", classOf[OrganizationDocument])

  val memberRepository: MemberRepository             = new MongoMemberRepository(membersColl)
  val organizationRepository: OrganizationRepository = new MongoOrganizationRepository(organizationsColl)

  val userService: UserService           = new UserServiceImpl(memberRepository, organizationRepository)
  val userQueryService: UserQueryService = new UserQueryServiceImpl(memberRepository, organizationRepository)

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
  val authService: AuthenticationService = new KeycloakAuthenticationService(kcTokenClient, kcAdminApi, roleIds)

  val mediaService: MediaService = new MediaServiceClient()

  val publicKeysCache: TrieMap[String, PublicKey] = TrieMap.empty
