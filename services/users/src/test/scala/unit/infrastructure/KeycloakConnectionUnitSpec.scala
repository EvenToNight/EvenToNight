package unit.infrastructure

import fixtures.UserFixtures._
import infrastructure.KeycloakConnection
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
      .thenRespond("""{"access_token": "test_token"}""")
      .whenRequestMatches(_.uri.path == createUserPath)
      .thenRespond(response)
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

  private val successResponse = Response(
    body = "",
    code = StatusCode.Created,
    statusText = "Created",
    headers = List(Header("Location", s"/admin/realms/eventonight/users/$testKeycloakId"))
  )

  "requestAccessToken" should "return Right(access_token) when Keycloak returns valid JSON with access_token" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, """{"access_token": "test_token"}""")
    val token = connectionStub.requestAccessToken(
      Map(
        "grant_type"    -> "client_credentials",
        "client_id"     -> "users-service",
        "client_secret" -> testSecret
      )
    )
    token shouldBe Right("test_token")

  it should "return Left when Keycloak returns 200 with invalid JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Invalid JSON")

  it should "return Left when Keycloak returns 200 with access_token missing in a valid JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, """{"some_field": "some_value"}""")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Missing access_token")

  it should "return Left when Keycloak returns 400 with invalid JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Invalid JSON")

  it should "return Left when Keycloak returns 400 with invalid_grant error" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, """{"error": "invalid_grant"}""")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Invalid credentials")

  it should "return Left when Keycloak returns 400 with other error" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, """{"error": "other_error"}""")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Keycloak error")

  it should "return Left when Keycloak returns 400 with JSON missing error field" in:
    val connectionStub =
      stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, """{"some_field": "some_value"}""")
    val token = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Keycloak error")

  it should "return Left when Keycloak returns 401 Unauthorized" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Unauthorized, "Unauthorized access")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Invalid credentials")

  it should "return Left when Keycloak returns 403 Forbidden" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Forbidden, "Forbidden access")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Client not allowed")

  it should "return Left for unexpected Keycloak status" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadGateway, "Bad Gateway")
    val token          = connectionStub.requestAccessToken(dummyForm)
    token.left.value should include("Unexpected Keycloak status")

  "getClientAccessToken" should "return Right(access_token) when Keycloak returns valid token" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, """{"access_token": "test_token"}""")
    val token          = connectionStub.getClientAccessToken()
    token shouldBe Right("test_token")

  it should "propagate errors from requestAccessToken" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "")
    val token          = connectionStub.getClientAccessToken()
    token.left.value should include("Invalid JSON")

  "createUser" should "return Right(keycloakId, userId) when Keycloak returns 201 with Location header" in:
    val connectionStub       = stubbedCreateUserConnectionWithResponse(successResponse)
    val result               = connectionStub.createUser(username, email, password)
    val (keycloakId, userId) = result.getOrElse(fail(s"Expected Right but got Left($result)"))
    keycloakId shouldBe testKeycloakId
    noException shouldBe thrownBy(UUID.fromString(userId))

  it should "propagate errors from getClientAccessToken" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Forbidden, "Forbidden access")
    val result         = connectionStub.createUser(username, email, password)
    result.isLeft shouldBe true
    result.left.value should include("Client not allowed")

  it should "return Left when Location header is missing" in:
    val responseWithoutLocation = Response(
      body = "",
      code = StatusCode.Created,
      statusText = "Created"
    )
    val connectionStub = stubbedCreateUserConnectionWithResponse(responseWithoutLocation)
    val result         = connectionStub.createUser(username, email, password)
    result shouldBe Left("User created but could not retrieve ID from Keycloak")

  it should "return Left when Keycloak returns non-201 status" in:
    val errorResponse = Response(
      body = "Error creating user",
      code = StatusCode.BadRequest,
      statusText = "Bad Request"
    )
    val connectionStub = stubbedCreateUserConnectionWithResponse(errorResponse)
    val result         = connectionStub.createUser(username, email, password)
    result.isLeft shouldBe true
    result.left.value should include("Failed to create user on Keycloak")

  it should "include the generated userId in the request JSON" in:
    var capturedJsonBody: String = ""
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == tokenPath)
      .thenRespond("""{"access_token": "test_token"}""")
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

  "deleteUser" should "return Right(()) when Keycloak returns 204 on delete" in:
    val deleteResponse = Response(
      body = "",
      code = StatusCode.NoContent,
      statusText = "No Content"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testKeycloakId, deleteResponse)
    val result         = connectionStub.deleteUser(testKeycloakId)
    result shouldBe Right(())

  it should "return Left when Keycloak returns non-204 status" in:
    val unauthorizedResponse = Response(
      body = "Unauthorized",
      code = StatusCode.Unauthorized,
      statusText = "Unauthorized"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testKeycloakId, unauthorizedResponse)
    val result         = connectionStub.deleteUser(testKeycloakId)
    result.isLeft shouldBe true
    result.left.value should include("Failed to delete user")

  it should "propagate errors from getClientAccessToken" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Forbidden, "Forbidden access")
    val result         = connectionStub.deleteUser(testKeycloakId)
    result.isLeft shouldBe true
    result.left.value should include("Client not allowed")
