package unit.infrastructure

import fixtures.UserFixtures._
import infrastructure.KeycloakConnection
import model.Tokens
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import sttp.client3.Response
import sttp.client3.StringBody
import sttp.client3.testing._
import sttp.model.Header
import sttp.model.Method
import sttp.model.StatusCode

import java.util.UUID

class KeycloakConnectionUnitSpec extends AnyFlatSpec with Matchers:
  private val tokenPath                      = List("realms", "eventonight", "protocol", "openid-connect", "token")
  private val testSecret                     = "test-secret"
  private val createUserPath                 = List("admin", "realms", "eventonight", "users")
  private val dummyForm: Map[String, String] = Map.empty
  private val testKeycloakId                 = "3c4d5e6f-7a8b-9c0d-1e2f-3456789abcde"

  private def stubbedConnectionWithStatusCodeAndBody(code: StatusCode, body: String) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond(Response(body, code))
    new KeycloakConnection(backendStub, testSecret)

  private def stubbedCreateUserConnectionWithResponse(response: Response[String]) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond("""{"access_token": "test_access_token"}""")
      .whenRequestMatches(_.uri.path == createUserPath)
      .thenRespond(response)
    new KeycloakConnection(backendStub, testSecret)

  private def stubbedDeleteUserConnectionWithResponse(userId: String, response: Response[String]) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond("""{"access_token": "test_access_token"}""")
      .whenRequestMatches(req =>
        req.uri.path == List("admin", "realms", "eventonight", "users", userId) && req.method == Method.DELETE
      )
      .thenRespond(response)
    new KeycloakConnection(backendStub, testSecret)

  private val successResponse = Response(
    body = "",
    code = StatusCode.Created,
    statusText = "Created",
    headers = List(Header("Location", s"/admin/realms/eventonight/users/$testKeycloakId"))
  )

  "sendTokenRequest" should "return Right(body) when request succeeds" in:
    val body           = """{"some": "data"}"""
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, body)
    val result         = connectionStub.sendTokenRequest(dummyForm)
    result shouldBe Right(body)

  it should "return Left when request is bad" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val result         = connectionStub.sendTokenRequest(dummyForm)
    result.left.value should include("Bad request")

  it should "return Left when credentials are invalid" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Unauthorized, "Unauthorized access")
    val result         = connectionStub.sendTokenRequest(dummyForm)
    result.left.value should include("Invalid credentials")

  it should "return Left when client is forbidden" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Forbidden, "Forbidden access")
    val result         = connectionStub.sendTokenRequest(dummyForm)
    result.left.value should include("Client not allowed")

  it should "return Left for unexpected server response" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.InternalServerError, "Error")
    val result         = connectionStub.sendTokenRequest(dummyForm)
    result.left.value should include("Unexpected Keycloak status")

  "requestAccessToken" should "return Right(access_token) when client credentials are valid" in:
    val connectionStub =
      stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, """{"access_token": "test_access_token"}""")
    val token = connectionStub.requestAccessToken(
      Map(
        "grant_type"    -> "client_credentials",
        "client_id"     -> "users-service",
        "client_secret" -> testSecret
      )
    )
    token shouldBe Right("test_access_token")

  it should "return Left when sendTokenRequest fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Bad request")

  it should "return Left when response JSON is invalid" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Invalid JSON")

  it should "return Left when access_token is missing in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, """{"some_field": "some_value"}""")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Missing access_token")

  "getClientAccessToken" should "return Right(access_token) when client credentials are valid" in:
    val connectionStub =
      stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, """{"access_token": "test_access_token"}""")
    val token = connectionStub.getClientAccessToken()
    token shouldBe Right("test_access_token")

  it should "return Left when requestAccessToken fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val token          = connectionStub.getClientAccessToken()
    token.left.value should include("Bad request")

  "createUser" should "return Right(keycloakId, userId) when creation succeeds and Location header is present" in:
    val connectionStub       = stubbedCreateUserConnectionWithResponse(successResponse)
    val result               = connectionStub.createUser(username, email, password)
    val (keycloakId, userId) = result.getOrElse(fail(s"Expected Right but got Left($result)"))
    keycloakId shouldBe testKeycloakId
    noException shouldBe thrownBy(UUID.fromString(userId))

  it should "return Left when getClientAccessToken fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Forbidden, "Forbidden access")
    val result         = connectionStub.createUser(username, email, password)
    result.left.value should include("Client not allowed")

  it should "return Left when creation succeeds but Location header is missing" in:
    val responseWithoutLocation = Response(
      body = "",
      code = StatusCode.Created,
      statusText = "Created"
    )
    val connectionStub = stubbedCreateUserConnectionWithResponse(responseWithoutLocation)
    val result         = connectionStub.createUser(username, email, password)
    result shouldBe Left("User created but could not retrieve ID from Keycloak")

  it should "return Left when user creation fails" in:
    val errorResponse = Response(
      body = "Error creating user",
      code = StatusCode.BadRequest,
      statusText = "Bad Request"
    )
    val connectionStub = stubbedCreateUserConnectionWithResponse(errorResponse)
    val result         = connectionStub.createUser(username, email, password)
    result.left.value should include("Failed to create user on Keycloak")

  it should "include the generated userId in the request JSON" in:
    var capturedJsonBody: String = ""
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond("""{"access_token": "test_access_token"}""")
      .whenRequestMatches(req =>
        req.uri.path == createUserPath &&
          (req.body match
            case StringBody(body, _, _) =>
              capturedJsonBody = body
              true
            case _ => false)
      )
      .thenRespond(successResponse)
    val connectionStub = new KeycloakConnection(backendStub, testSecret)
    val result         = connectionStub.createUser(username, email, password)
    result.isRight shouldBe true
    val (_, generatedUserId) = result.value
    capturedJsonBody should include(generatedUserId)
    noException shouldBe thrownBy(UUID.fromString(generatedUserId))

  "deleteUser" should "return Right(()) when user is successfully deleted" in:
    val deleteResponse = Response(
      body = "",
      code = StatusCode.NoContent,
      statusText = "No Content"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testKeycloakId, deleteResponse)
    val result         = connectionStub.deleteUser(testKeycloakId)
    result shouldBe Right(())

  it should "return Left when user deletion fails" in:
    val unauthorizedResponse = Response(
      body = "Unauthorized",
      code = StatusCode.Unauthorized,
      statusText = "Unauthorized"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testKeycloakId, unauthorizedResponse)
    val result         = connectionStub.deleteUser(testKeycloakId)
    result.left.value should include("Failed to delete user")

  it should "return Left when getClientAccessToken fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Forbidden, "Forbidden access")
    val result         = connectionStub.deleteUser(testKeycloakId)
    result.left.value should include("Client not allowed")

  "requestUserTokensForLogin" should "return Right(Tokens) when both access_token and refresh_token are present in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(
      StatusCode.Ok,
      """{"access_token": "test_access_token", "refresh_token": "test_refresh_token"}"""
    )
    val tokens = connectionStub.requestUserTokensForLogin(dummyForm)
    tokens shouldBe Right(Tokens("test_access_token", "test_refresh_token"))

  it should "return Left when sendTokenRequest fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val tokens         = connectionStub.requestUserTokensForLogin(dummyForm)
    tokens.left.value should include("Bad request")

  it should "return Left when response JSON is invalid" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val tokens         = connectionStub.requestUserTokensForLogin(dummyForm)
    tokens.left.value should include("Invalid JSON")

  it should "return Left when access_token is missing in JSON" in:
    val connectionStub =
      stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, """{"refresh_token": "test_refresh_token"}""")
    val tokens = connectionStub.requestUserTokensForLogin(dummyForm)
    tokens.left.value should include("Missing access_token")

  it should "return Left when refresh_token is missing in JSON" in:
    val connectionStub =
      stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, """{"access_token": "test_access_token"}""")
    val tokens = connectionStub.requestUserTokensForLogin(dummyForm)
    tokens.left.value should include("Missing refresh_token")

  "loginUser" should "return Right(Tokens) when user credentials are valid" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(
      StatusCode.Ok,
      """{"access_token": "test_access_token", "refresh_token": "test_refresh_token"}"""
    )
    val tokens = connectionStub.loginUser("testuser", "testpassword")
    tokens shouldBe Right(Tokens("test_access_token", "test_refresh_token"))

  it should "return Left when requestUserTokensForLogin fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Unauthorized, "Invalid credentials")
    val tokens         = connectionStub.loginUser("testuser", "wrongpassword")
    tokens.left.value should include("Invalid credentials")
