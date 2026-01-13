package infrastructure.keycloak

import model.UserTokens

class KeycloakTokenClient(tokenService: KeycloakTokenService, clientId: String, clientSecret: String):
  def getClientAccessToken(): Either[String, String] =
    tokenService.requestAccessToken(
      Map(
        "grant_type"    -> "client_credentials",
        "client_id"     -> clientId,
        "client_secret" -> clientSecret
      )
    )

  def loginUser(usernameOrEmail: String, password: String): Either[String, UserTokens] =
    tokenService.requestUserTokensForLogin(
      Map(
        "grant_type"    -> "password",
        "client_id"     -> clientId,
        "client_secret" -> clientSecret,
        "username"      -> usernameOrEmail,
        "password"      -> password
      )
    )

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
