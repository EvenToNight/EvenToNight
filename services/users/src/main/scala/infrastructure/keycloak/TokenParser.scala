package infrastructure.keycloak

import application.dto.UserTokens
import io.circe.Json

object TokenParser:
  def parseAccessToken(json: Json): Either[String, String] =
    json.hcursor.get[String]("access_token").left.map(_ => "Missing access_token")

  def parseUserTokens(json: Json, fallbackRefresh: Option[String]): Either[String, UserTokens] =
    for
      accessToken <- parseAccessToken(json)
      refreshToken <- json.hcursor.get[String]("refresh_token").toOption
        .orElse(fallbackRefresh).toRight("Missing refresh_token")
      expiresIn <-
        json.hcursor.get[Long]("expires_in").left.map(_ => "Missing expires_in")
      refreshExpiresIn <-
        json.hcursor.get[Long]("refresh_expires_in").left.map(_ => "Missing refresh_expires_in")
    yield UserTokens(accessToken, expiresIn, refreshToken, refreshExpiresIn)
