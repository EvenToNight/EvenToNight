package fixtures

import io.circe.Json
import io.circe.literal._

object TokenFixtures:
  val testAccessToken            = "test_access_token"
  val testExpiresIn: Long        = 300
  val testRefreshToken           = "test_refresh_token"
  val testRefreshExpiresIn: Long = 1800
  val testFallbackRefresh        = "fallback_refresh_token"

  val jsonWithAccessToken = json"""{"access_token": $testAccessToken}"""
  val jsonCompleteToken =
    json"""{
      "access_token": $testAccessToken,
      "expires_in": $testExpiresIn,
      "refresh_token": $testRefreshToken,
      "refresh_expires_in": $testRefreshExpiresIn
    }"""
  val jsonMissingAccessToken =
    json"""{
      "expires_in": $testExpiresIn,
      "refresh_token": $testRefreshToken,
      "refresh_expires_in": $testRefreshExpiresIn
    }"""
  val jsonMissingExpiresIn =
    json"""{
      "access_token": $testAccessToken,
      "refresh_token": $testRefreshToken,
      "refresh_expires_in": $testRefreshExpiresIn
    }"""
  val jsonMissingRefreshToken =
    json"""{
      "access_token": $testAccessToken,
      "expires_in": $testExpiresIn,
      "refresh_expires_in": $testRefreshExpiresIn
    }"""
  val jsonMissingRefreshExpiresIn =
    json"""{
      "access_token": $testAccessToken,
      "expires_in": $testExpiresIn,
      "refresh_token": $testRefreshToken
    }"""
