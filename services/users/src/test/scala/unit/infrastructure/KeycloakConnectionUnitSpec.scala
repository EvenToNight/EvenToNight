package unit.infrastructure

import fixtures.UserFixtures._
import infrastructure.KeycloakConnection
import io.circe.Json
import io.circe.literal._
import model.UserTokens
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

  private val testAccessToken     = "test_access_token"
  private val jsonWithAccessToken = json"""{"access_token": $testAccessToken}"""

  private val testExpiresIn: Long        = 300
  private val testRefreshToken           = "test_refresh_token"
  private val testRefreshExpiresIn: Long = 1800
  private val testFallbackRefresh        = "fallback_refresh_token"
  private val jsonCompleteToken =
    json"""{"access_token": $testAccessToken, "expires_in": $testExpiresIn, "refresh_token": $testRefreshToken, "refresh_expires_in": $testRefreshExpiresIn}"""
  private val jsonMissingAccessToken =
    json"""{"expires_in": $testExpiresIn, "refresh_token": $testRefreshToken, "refresh_expires_in": $testRefreshExpiresIn}"""
  private val jsonMissingExpiresIn =
    json"""{"access_token": $testAccessToken, "refresh_token": $testRefreshToken, "refresh_expires_in": $testRefreshExpiresIn}"""
  private val jsonMissingRefreshToken =
    json"""{"access_token": $testAccessToken, "expires_in": $testExpiresIn, "refresh_expires_in": $testRefreshExpiresIn}"""
  private val jsonMissingRefreshExpiresIn =
    json"""{"access_token": $testAccessToken, "expires_in": $testExpiresIn, "refresh_token": $testRefreshToken}"""

  private def stubbedConnectionWithStatusCodeAndBody(code: StatusCode, body: String) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond(Response(body, code))
    new KeycloakConnection(backendStub, testSecret)

  private def stubbedConnectionWithStatusCodeAndJson(code: StatusCode, json: Json) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond(Response(json.noSpaces, code))
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

  "requestAccessToken" should "return Right(access_token) when access_token is present in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonWithAccessToken)
    val result         = connectionStub.requestAccessToken(dummyForm)
    result shouldBe Right(testAccessToken)

  it should "return Left when sendTokenRequest fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val result         = connectionStub.requestAccessToken(dummyForm)
    result.left.value should include("Bad request")

  it should "return Left when parseJson fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val result         = connectionStub.requestAccessToken(dummyForm)
    result.left.value should include("Invalid JSON")

  it should "return Left when access_token is missing in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingAccessToken)
    val result         = connectionStub.requestAccessToken(dummyForm)
    result.left.value should include("Missing access_token")

  "getClientAccessToken" should "return Right(access_token) when client credentials are valid" in:
    val connectionStub =
      stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonWithAccessToken)
    val result = connectionStub.getClientAccessToken()
    result shouldBe Right(testAccessToken)

  it should "return Left when requestAccessToken fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val result         = connectionStub.getClientAccessToken()
    result.left.value should include("Bad request")

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

  "parseUserTokens" should "return Right(UserTokens) when access_token, expires_in, refresh_token and refresh_expires_in are present in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonCompleteToken)
    val result         = connectionStub.parseUserTokens(jsonCompleteToken, None)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  it should "return Right(UserTokens) using fallback refresh token when refresh_token is missing in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingRefreshToken)
    val result         = connectionStub.parseUserTokens(jsonMissingRefreshToken, Some(testFallbackRefresh))
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testFallbackRefresh, testRefreshExpiresIn))

  it should "return Left when access_token is missing in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingAccessToken)
    val result         = connectionStub.parseUserTokens(jsonMissingAccessToken, None)
    result.left.value should include("Missing access_token")

  it should "return Left when refresh_token is missing in JSON and no fallback is provided" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingRefreshToken)
    val result         = connectionStub.parseUserTokens(jsonMissingRefreshToken, None)
    result.left.value should include("Missing refresh_token")

  it should "return Left when expires_in is missing in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingExpiresIn)
    val result         = connectionStub.parseUserTokens(jsonMissingExpiresIn, None)
    result.left.value should include("Missing expires_in")

  it should "return Left when refresh_expires_in is missing in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingRefreshExpiresIn)
    val result         = connectionStub.parseUserTokens(jsonMissingRefreshExpiresIn, None)
    result.left.value should include("Missing refresh_expires_in")

  "requestUserTokensForLogin" should "return Right(UserTokens) when Keycloak returns a valid token JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonCompleteToken)
    val result         = connectionStub.requestUserTokensForLogin(dummyForm)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  it should "return Left when sendTokenRequest fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val result         = connectionStub.requestUserTokensForLogin(dummyForm)
    result.left.value should include("Bad request")

  it should "return Left when parseJson fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val result         = connectionStub.requestUserTokensForLogin(dummyForm)
    result.left.value should include("Invalid JSON")

  it should "return Left when parseUserTokens fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonWithAccessToken)
    val result         = connectionStub.requestUserTokensForLogin(dummyForm)
    result.left.value should include("Missing refresh_token")

  "requestUserTokensForRefresh" should "return Right(UserTokens) when Keycloak returns a valid token JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonCompleteToken)
    val result         = connectionStub.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  it should "return Right(UserTokens) using fallback refresh token when refresh_token is missing in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingRefreshToken)
    val result         = connectionStub.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testFallbackRefresh, testRefreshExpiresIn))

  it should "return Left when sendTokenRequest fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val result         = connectionStub.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result.left.value should include("Bad request")

  it should "return Left when parseJson fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val result         = connectionStub.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result.left.value should include("Invalid JSON")

  it should "return Left when parseUserTokens fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingExpiresIn)
    val result         = connectionStub.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result.left.value should include("Missing expires_in")

  "loginUser" should "return Right(UserTokens) when user credentials are valid" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonCompleteToken)
    val result         = connectionStub.loginUser("testuser", "testpassword")
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  it should "return Left when requestUserTokensForLogin fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Unauthorized, "Invalid credentials")
    val result         = connectionStub.loginUser("testuser", "wrongpassword")
    result.left.value should include("Invalid credentials")

  "refreshUserTokens" should "return Right(UserTokens) when Keycloak returns a valid refresh token response" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonCompleteToken)
    val result         = connectionStub.refreshUserTokens(testRefreshToken)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  it should "return Left when requestUserTokensForRefresh fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val result         = connectionStub.refreshUserTokens(testRefreshToken)
    result.left.value should include("Invalid JSON")
