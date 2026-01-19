package unit.infrastructure

import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import sttp.model.StatusCode

import keycloak.TestHelpers._

class KeycloakConnectionUnitSpec extends AnyFlatSpec with Matchers:
  "sendTokenRequest" should "return Right(body) when request succeeds" in:
    val body           = """{"access_token": $testAccessToken}"""
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
