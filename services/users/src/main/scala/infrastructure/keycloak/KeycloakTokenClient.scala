package infrastructure.keycloak

import domain.UserTokens

class KeycloakTokenClient(tokenService: KeycloakTokenService, clientId: String, clientSecret: String):
  private def passwordGrantParams(username: String, password: String): Map[String, String] =
    Map(
      "grant_type"    -> "password",
      "client_id"     -> clientId,
      "client_secret" -> clientSecret,
      "username"      -> username,
      "password"      -> password
    )

  def getClientAccessToken(): Either[String, String] =
    tokenService.requestAccessToken(
      Map(
        "grant_type"    -> "client_credentials",
        "client_id"     -> clientId,
        "client_secret" -> clientSecret
      )
    )

  def loginUser(usernameOrEmail: String, password: String): Either[String, UserTokens] =
    tokenService.requestUserTokensForLogin(passwordGrantParams(usernameOrEmail, password))

  def refreshUserTokens(refreshToken: String): Either[String, UserTokens] =
    tokenService.requestUserTokensForRefresh(
      Map(
        "grant_type"    -> "refresh_token",
        "client_id"     -> clientId,
        "client_secret" -> clientSecret,
        "refresh_token" -> refreshToken
      ),
      refreshToken
    )

  def revokeRefreshToken(refreshToken: String): Either[String, Unit] =
    tokenService.requestRefreshTokenRevocation(
      Map(
        "client_id"     -> clientId,
        "client_secret" -> clientSecret,
        "refresh_token" -> refreshToken
      )
    )

  def verifyCurrentPassword(username: String, password: String): Boolean =
    tokenService.verifyUserCredentials(passwordGrantParams(username, password))
