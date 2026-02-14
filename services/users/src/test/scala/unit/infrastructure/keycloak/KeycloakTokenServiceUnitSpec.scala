package unit.infrastructure.keycloak

import domain.UserTokens
import fixtures.TokenFixtures._
import infrastructure.keycloak.KeycloakTokenService
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import sttp.model.StatusCode

import TestHelpers._

class KeycloakTokenServiceUnitSpec extends AnyFlatSpec with Matchers:
  "requestAccessToken" should "return Right(access_token) when access_token is present in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonWithAccessToken)
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestAccessToken(dummyForm)
    result shouldBe Right(testAccessToken)

  it should "return Left when sendTokenRequest fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestAccessToken(dummyForm)
    result.left.value should include("Bad request")

  it should "return Left when parseJson fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestAccessToken(dummyForm)
    result.left.value should include("Invalid JSON")

  it should "return Left when parseAccessToken fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingAccessToken)
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestAccessToken(dummyForm)
    result.left.value should include("Missing access_token")

  "requestUserTokensForLogin" should "return Right(UserTokens) when Keycloak returns a valid token JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonCompleteToken)
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForLogin(dummyForm)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  it should "return Left when sendTokenRequest fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForLogin(dummyForm)
    result.left.value should include("Bad request")

  it should "return Left when parseJson fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForLogin(dummyForm)
    result.left.value should include("Invalid JSON")

  it should "return Left when parseUserTokens fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonWithAccessToken)
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForLogin(dummyForm)
    result.left.value should include("Missing refresh_token")

  "requestUserTokensForRefresh" should "return Right(UserTokens) when Keycloak returns a valid token JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonCompleteToken)
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  it should "return Right(UserTokens) using fallback refresh token when refresh_token is missing in JSON" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingRefreshToken)
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testFallbackRefresh, testRefreshExpiresIn))

  it should "return Left when sendTokenRequest fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.BadRequest, "Bad request")
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result.left.value should include("Bad request")

  it should "return Left when parseJson fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndBody(StatusCode.Ok, "")
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result.left.value should include("Invalid JSON")

  it should "return Left when parseUserTokens fails" in:
    val connectionStub = stubbedConnectionWithStatusCodeAndJson(StatusCode.Ok, jsonMissingExpiresIn)
    val tokenService   = new KeycloakTokenService(connectionStub)
    val result         = tokenService.requestUserTokensForRefresh(dummyForm, testFallbackRefresh)
    result.left.value should include("Missing expires_in")
