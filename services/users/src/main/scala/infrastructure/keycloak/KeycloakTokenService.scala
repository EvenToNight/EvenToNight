package infrastructure.keycloak

import model.UserTokens

import JsonUtils.parseJson
import TokenParser._

class KeycloakTokenService(connection: KeycloakConnection):
  def requestAccessToken(form: Map[String, String]): Either[String, String] =
    connection.sendTokenRequest(form).flatMap(body =>
      parseJson(body).flatMap(json =>
        parseAccessToken(json)
      )
    )

  def requestUserTokensForLogin(form: Map[String, String]): Either[String, UserTokens] =
    connection.sendTokenRequest(form).flatMap(body =>
      parseJson(body).flatMap(json =>
        parseUserTokens(json, None)
      )
    )

  def requestUserTokensForRefresh(form: Map[String, String], oldRefreshToken: String): Either[String, UserTokens] =
    connection.sendTokenRequest(form).flatMap(body =>
      parseJson(body).flatMap(json =>
        parseUserTokens(json, Some(oldRefreshToken))
      )
    )

  def requestRefreshTokenRevocation(form: Map[String, String]): Either[String, Unit] =
    connection.sendLogoutRequest(form)
