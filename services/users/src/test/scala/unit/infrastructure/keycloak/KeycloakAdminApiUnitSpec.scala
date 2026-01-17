package unit.infrastructure.keycloak

import fixtures.TokenFixtures._
import fixtures.UserFixtures._
import infrastructure.keycloak.KeycloakAdminApi
import infrastructure.keycloak.KeycloakConnection
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

class KeycloakAdminApiUnitSpec extends AnyFlatSpec with Matchers:
  private val createUserPath = List("admin", "realms", "eventonight", "users")
  private val testKeycloakId = "3c4d5e6f-7a8b-9c0d-1e2f-3456789abcde"

  private def stubbedCreateUserConnectionWithResponse(response: Response[String]) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(_.uri.path == createUserPath)
      .thenRespond(response)
    new KeycloakConnection(backendStub)

  private def stubbedDeleteUserConnectionWithResponse(userId: String, response: Response[String]) =
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(req =>
        req.uri.path == List("admin", "realms", "eventonight", "users", userId) && req.method == Method.DELETE
      )
      .thenRespond(response)
    new KeycloakConnection(backendStub)

  private val successResponse = Response(
    body = "",
    code = StatusCode.Created,
    statusText = "Created",
    headers = List(Header("Location", s"/admin/realms/eventonight/users/$testKeycloakId"))
  )

  "createUser" should "return Right(keycloakId, userId) when creation succeeds and Location header is present" in:
    val connectionStub       = stubbedCreateUserConnectionWithResponse(successResponse)
    val kcAdminApi           = new KeycloakAdminApi(connectionStub)
    val result               = kcAdminApi.createUser(testAccessToken, username, email, password)
    val (keycloakId, userId) = result.getOrElse(fail(s"Expected Right but got Left($result)"))
    keycloakId shouldBe testKeycloakId
    noException shouldBe thrownBy(UUID.fromString(userId))

  it should "return Left when creation succeeds but Location header is missing" in:
    val responseWithoutLocation = Response(
      body = "",
      code = StatusCode.Created,
      statusText = "Created"
    )
    val connectionStub = stubbedCreateUserConnectionWithResponse(responseWithoutLocation)
    val kcAdminApi     = new KeycloakAdminApi(connectionStub)
    val result         = kcAdminApi.createUser(testAccessToken, username, email, password)
    result shouldBe Left("User created but could not retrieve ID from Keycloak")

  it should "return Left when user creation fails" in:
    val errorResponse = Response(
      body = "Error creating user",
      code = StatusCode.BadRequest,
      statusText = "Bad Request"
    )
    val connectionStub = stubbedCreateUserConnectionWithResponse(errorResponse)
    val kcAdminApi     = new KeycloakAdminApi(connectionStub)
    val result         = kcAdminApi.createUser(testAccessToken, username, email, password)
    result.left.value should include("Failed to create user on Keycloak")

  it should "include the generated userId in the request JSON" in:
    var capturedJsonBody: String = ""
    val backendStub = SttpBackendStub.synchronous
      .whenRequestMatches(req =>
        req.uri.path == createUserPath &&
          (req.body match
            case StringBody(body, _, _) =>
              capturedJsonBody = body
              true
            case _ => false)
      )
      .thenRespond(successResponse)
    val connectionStub = new KeycloakConnection(backendStub)
    val kcAdminApi     = new KeycloakAdminApi(connectionStub)
    val result         = kcAdminApi.createUser(testAccessToken, username, email, password)
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
    val kcAdminApi     = new KeycloakAdminApi(connectionStub)
    val result         = kcAdminApi.deleteUser(testAccessToken, testKeycloakId)
    result shouldBe Right(())

  it should "return Left when user to delete is not found" in:
    val notFoundResponse = Response(
      body = "Not found",
      code = StatusCode.NotFound,
      statusText = "Not found"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testKeycloakId, notFoundResponse)
    val kcAdminApi     = new KeycloakAdminApi(connectionStub)
    val result         = kcAdminApi.deleteUser(testAccessToken, testKeycloakId)
    result.left.value should include("User not found")

  it should "return Left when client is unauthorized" in:
    val unauthorizedResponse = Response(
      body = "Unauthorized",
      code = StatusCode.Unauthorized,
      statusText = "Unauthorized"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testKeycloakId, unauthorizedResponse)
    val kcAdminApi     = new KeycloakAdminApi(connectionStub)
    val result         = kcAdminApi.deleteUser(testAccessToken, testKeycloakId)
    result.left.value should include("Unauthorized on Keycloak")

  it should "return Left when client is forbidden" in:
    val forbiddenResponse = Response(
      body = "Forbidden",
      code = StatusCode.Forbidden,
      statusText = "Forbidden"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testKeycloakId, forbiddenResponse)
    val kcAdminApi     = new KeycloakAdminApi(connectionStub)
    val result         = kcAdminApi.deleteUser(testAccessToken, testKeycloakId)
    result.left.value should include("Insufficient permissions in Keycloak")

  it should "return Left for other error" in:
    val errorResponse = Response(
      body = "Error deleting user",
      code = StatusCode.BadRequest,
      statusText = "Bad Request"
    )
    val connectionStub = stubbedDeleteUserConnectionWithResponse(testKeycloakId, errorResponse)
    val kcAdminApi     = new KeycloakAdminApi(connectionStub)
    val result         = kcAdminApi.deleteUser(testAccessToken, testKeycloakId)
    result.left.value should include("Failed to delete user on Keycloak")
