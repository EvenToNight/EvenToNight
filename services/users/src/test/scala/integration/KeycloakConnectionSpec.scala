package integration

import fixtures.UserFixtures._
import infrastructure.KeycloakConnection
import infrastructure.Secret.usersServiceSecret
import org.scalatest.BeforeAndAfterEach
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import sttp.client3.HttpURLConnectionBackend

import java.util.UUID

class KeycloakConnectionSpec extends AnyFlatSpec with Matchers with BeforeAndAfterEach:
  private val backend                      = HttpURLConnectionBackend()
  private val connection                   = new KeycloakConnection(backend, usersServiceSecret)
  private var createdUserIds: List[String] = List()

  private def trackCreatedUser(userId: String): Unit =
    createdUserIds = userId :: createdUserIds

  override def afterEach(): Unit =
    super.afterEach()
    createdUserIds.foreach(userId =>
      connection.deleteUser(userId)
    )
    createdUserIds = List()

  "getAccessToken" should "retrieve an access token from Keycloak" in:
    val tokenResult = connection.getAccessToken()
    tokenResult.isRight shouldBe true
    val token = tokenResult.value
    token.split("\\.").length shouldBe 3

  it should "fail to retrieve an access token with invalid credentials" in:
    val invalidConnection = new KeycloakConnection(backend, "invalidSecret")
    val tokenResult       = invalidConnection.getAccessToken()
    tokenResult.isLeft shouldBe true

  "createUser" should "create a new user in Keycloak" in:
    val result = connection.createUser(username, email, password)
    result.isRight shouldBe true
    val (keycloakId, userId) = result.value
    trackCreatedUser(keycloakId)
    noException shouldBe thrownBy(UUID.fromString(userId))

  it should "fail to create user when access token cannot be retrieved" in:
    val invalidConnection = new KeycloakConnection(backend, "invalidSecret")
    val result            = invalidConnection.createUser(username, email, password)
    result.isLeft shouldBe true

  it should "not allow creating a user with an existing username" in:
    val firstResult = connection.createUser(username, email, password)
    firstResult.isRight shouldBe true
    val (keycloakId, _) = firstResult.value
    trackCreatedUser(keycloakId)
    val secondResult = connection.createUser(username, "newuser@test.com", "123")
    secondResult.isLeft shouldBe true

  it should "not allow creating a user with an existing email" in:
    val firstResult = connection.createUser(username, email, password)
    firstResult.isRight shouldBe true
    val (keycloakId, _) = firstResult.value
    trackCreatedUser(keycloakId)
    val secondResult = connection.createUser("newuser", email, "123")
    secondResult.isLeft shouldBe true
