package unit.infrastructure.keycloak

import application.dto.UserTokens
import fixtures.TokenFixtures._
import infrastructure.keycloak.TokenParser._
import org.scalatest.EitherValues._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class TokenParserUnitSpec extends AnyFlatSpec with Matchers:
  "parseAccessToken" should "return Right(access_token) when access_token is present in JSON" in:
    val result = parseAccessToken(jsonWithAccessToken)
    result shouldBe Right(testAccessToken)

  it should "return Left when access_token is missing in JSON" in:
    val result = parseAccessToken(jsonMissingAccessToken)
    result.left.value should include("Missing access_token")

  "parseUserTokens" should "return Right(UserTokens) when access_token, expires_in, refresh_token and refresh_expires_in are present in JSON" in:
    val result = parseUserTokens(jsonCompleteToken, None)
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  it should "return Right(UserTokens) using fallback refresh token when refresh_token is missing in JSON" in:
    val result = parseUserTokens(jsonMissingRefreshToken, Some(testFallbackRefresh))
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testFallbackRefresh, testRefreshExpiresIn))

  it should "return Left when parseAccessToken fails" in:
    val result = parseUserTokens(jsonMissingAccessToken, None)
    result.left.value should include("Missing access_token")

  it should "return Left when refresh_token is missing in JSON and no fallback is provided" in:
    val result = parseUserTokens(jsonMissingRefreshToken, None)
    result.left.value should include("Missing refresh_token")

  it should "return Left when expires_in is missing in JSON" in:
    val result = parseUserTokens(jsonMissingExpiresIn, None)
    result.left.value should include("Missing expires_in")

  it should "return Left when refresh_expires_in is missing in JSON" in:
    val result = parseUserTokens(jsonMissingRefreshExpiresIn, None)
    result.left.value should include("Missing refresh_expires_in")
