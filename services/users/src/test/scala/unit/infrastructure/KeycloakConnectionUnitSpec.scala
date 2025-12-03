package unit.infrastructure

import infrastructure.KeycloakConnection
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import sttp.client3.testing._

class KeycloakConnectionUnitSpec extends AnyFlatSpec with Matchers:
  val tokenPath  = List("realms", "eventonight", "protocol", "openid-connect", "token")
  val testSecret = "test-secret"

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
