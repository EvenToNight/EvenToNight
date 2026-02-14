package unit.infrastructure.keycloak

import domain.UserTokens
import fixtures.TokenFixtures._
import infrastructure.keycloak.KeycloakTokenClient
import infrastructure.keycloak.KeycloakTokenService
import org.mockito.Mockito._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import TestHelpers._

class KeycloakTokenClientUnitSpec extends AnyFlatSpec with Matchers:
  "getClientAccessToken" should "delegate to requestAccessToken with client_credentials grant" in:
    val tokenServiceMock = mock(classOf[KeycloakTokenService])
    val tokenClient      = new KeycloakTokenClient(tokenServiceMock, testClientId, testSecret)
    when(tokenServiceMock.requestAccessToken(
      Map(
        "grant_type"    -> "client_credentials",
        "client_id"     -> testClientId,
        "client_secret" -> testSecret
      )
    )).thenReturn(Right(testAccessToken))
    val result = tokenClient.getClientAccessToken()
    verify(tokenServiceMock).requestAccessToken(
      Map(
        "grant_type"    -> "client_credentials",
        "client_id"     -> testClientId,
        "client_secret" -> testSecret
      )
    )
    result shouldBe Right(testAccessToken)

  "loginUser" should "delegate to requestUserTokensForLogin with password grant" in:
    val tokenServiceMock = mock(classOf[KeycloakTokenService])
    val tokenClient      = new KeycloakTokenClient(tokenServiceMock, testClientId, testSecret)
    when(tokenServiceMock.requestUserTokensForLogin(
      Map(
        "grant_type"    -> "password",
        "client_id"     -> testClientId,
        "client_secret" -> testSecret,
        "username"      -> "testuser",
        "password"      -> "testpassword"
      )
    )).thenReturn(Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn)))
    val result = tokenClient.loginUser("testuser", "testpassword")
    verify(tokenServiceMock).requestUserTokensForLogin(
      Map(
        "grant_type"    -> "password",
        "client_id"     -> testClientId,
        "client_secret" -> testSecret,
        "username"      -> "testuser",
        "password"      -> "testpassword"
      )
    )
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))

  "refreshUserTokens" should "delegate to requestUserTokensForRefresh with refresh_token grant" in:
    val tokenServiceMock = mock(classOf[KeycloakTokenService])
    val tokenClient      = new KeycloakTokenClient(tokenServiceMock, testClientId, testSecret)
    when(tokenServiceMock.requestUserTokensForRefresh(
      Map(
        "grant_type"    -> "refresh_token",
        "client_id"     -> testClientId,
        "client_secret" -> testSecret,
        "refresh_token" -> testFallbackRefresh
      ),
      testFallbackRefresh
    )).thenReturn(Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn)))
    val result = tokenClient.refreshUserTokens(testFallbackRefresh)
    verify(tokenServiceMock).requestUserTokensForRefresh(
      Map(
        "grant_type"    -> "refresh_token",
        "client_id"     -> testClientId,
        "client_secret" -> testSecret,
        "refresh_token" -> testFallbackRefresh
      ),
      testFallbackRefresh
    )
    result shouldBe Right(UserTokens(testAccessToken, testExpiresIn, testRefreshToken, testRefreshExpiresIn))
