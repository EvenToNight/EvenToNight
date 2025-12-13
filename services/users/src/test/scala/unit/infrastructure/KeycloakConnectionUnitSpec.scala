package unit.infrastructure

import fixtures.UserFixtures._
import infrastructure.KeycloakConnection
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import sttp.client3.Response
import sttp.client3.testing._
import sttp.model.Header
import sttp.model.Method
import sttp.model.StatusCode

class KeycloakConnectionUnitSpec extends AnyFlatSpec with Matchers:
  val tokenPath              = List("realms", "eventonight", "protocol", "openid-connect", "token")
  val testSecret             = "test-secret"
  private val createUserPath = List("admin", "realms", "eventonight", "users")
  private val testUserId     = "12345"

  def connectionWithResponse(responseBody: String) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond(responseBody)
    new KeycloakConnection(backendStub, testSecret)

  def connectionWithError(errMsg: String) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond(Left(errMsg))
    new KeycloakConnection(backendStub, testSecret)

  private def stubbedKeycloakConnection(keycloakResponse: Response[String]) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond("""{"access_token": "test_token"}""")
      .whenRequestMatches(_.uri.path == createUserPath)
      .thenRespond(keycloakResponse)
    new KeycloakConnection(backendStub, testSecret)

  private def stubbedDeleteUserConnectionWithResponse(userId: String, response: Response[String]) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond("""{"access_token": "test_token"}""")
      .whenRequestMatches(req =>
        req.uri.path == List("admin", "realms", "eventonight", "users", userId) && req.method == Method.DELETE
      )
      .thenRespond(response)
    new KeycloakConnection(backendStub, testSecret)

  "getAccessToken" should "extract the token from a valid Keycloak JSON response" in:
    val connectionStub = connectionWithResponse("""{"access_token": "test_token"}""")
    val token          = connectionStub.getAccessToken()
    token shouldEqual Right("test_token")

  it should "fail if a connection error occurs" in:
    val connectionStub = connectionWithError("Internal Server Error")
    val token          = connectionStub.getAccessToken()
    token match
      case Right(value) => fail("Expected Left, got Right")
      case Left(err)    => err should include("Keycloak error")

  it should "fail on invalid JSON response" in:
    val connectionStub = connectionWithResponse("")
    val token          = connectionStub.getAccessToken()
    token match
      case Right(value) => fail("Expected Left, got Right")
      case Left(err)    => err should include("Invalid JSON")

  it should "fail if access token is missing in a valid JSON" in:
    val connectionStub =
      connectionWithResponse("""{"error": "invalid_client","error_description": "Client credentials are invalid"}""")
    val token = connectionStub.getAccessToken()
    token match
      case Right(value) => fail("Expected Left, got Right")
      case Left(err)    => err should include("Missing access_token")

  "createUser" should "return Right(keycloakId) when Keycloak returns 201 with Location header" in:
    val successResponse = Response(
      body = "",
      code = StatusCode.Created,
      statusText = "Created",
      headers = List(Header("Location", "/admin/realms/eventonight/users/12345"))
    )
    val connectionStub = stubbedKeycloakConnection(successResponse)
    val result         = connectionStub.createUser(username, email, password)
    result shouldEqual Right("12345")

  it should "return Left when getAccessToken fails" in:
    val connectionStub = connectionWithError("Internal Server Error")
    val result         = connectionStub.createUser(username, email, password)
    result.isLeft shouldBe true
    result.left.value should include("Keycloak error")

  it should "return Left when Location header is missing" in:
    val responseWithoutLocation = Response(
      body = "",
      code = StatusCode.Created,
      statusText = "Created"
    )
    val connectionStub = stubbedKeycloakConnection(responseWithoutLocation)
    val result         = connectionStub.createUser(username, email, password)
    result shouldEqual Left("User created but could not retrieve ID from Keycloak")

  it should "return Left when Keycloak returns non-201 status" in:
    val errorResponse = Response(
      body = "Error creating user",
      code = StatusCode.BadRequest,
      statusText = "Bad Request"
    )
    val connectionStub = stubbedKeycloakConnection(errorResponse)
    val result         = connectionStub.createUser(username, email, password)
    result.isLeft shouldBe true
    result.left.value should include("Failed to create user on Keycloak")

  "deleteUser" should "return Right(()) when Keycloak successfully deletes the user" in:
    val deleteResponse = Response(
      body = "",
      code = StatusCode.NoContent,
      statusText = "No Content"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testUserId, deleteResponse)
    val result         = connectionStub.deleteUser(testUserId)
    result shouldEqual Right(())

  it should "return Left when Keycloak returns non-204 status" in:
    val unauthorizedResponse = Response(
      body = "Unauthorized",
      code = StatusCode.Unauthorized,
      statusText = "Unauthorized"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testUserId, unauthorizedResponse)
    val result         = connectionStub.deleteUser(testUserId)
    result.isLeft shouldBe true
    result.left.value should include("Failed to delete user")

  it should "return Left when getAccessToken fails" in:
    val connectionStub = connectionWithError("Internal Server Error")
    val result         = connectionStub.deleteUser(testUserId)
    result.isLeft shouldBe true
    result.left.value should include("Keycloak error")
