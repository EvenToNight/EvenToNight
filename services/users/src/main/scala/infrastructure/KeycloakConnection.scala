package infrastructure

import io.circe.Json
import io.circe.syntax._
import model.UserTokens
import sttp.client3._
import sttp.model.StatusCode

import java.util.UUID

import JsonUtils.parseJson

class KeycloakConnection(backend: SttpBackend[Identity, Any], clientSecret: String):
  private val keycloakUrl = sys.env.getOrElse("KEYCLOAK_URL", "http://localhost:8082")
  private val realm       = "eventonight"
  private val clientId    = "users-service"

  private def sendRequest[T](request: Request[T, Any]): Either[String, Response[T]] =
    try Right(request.send(backend))
    catch case e: Exception => Left(s"Connection error: ${e.getMessage}")

  def sendTokenRequest(form: Map[String, String]): Either[String, String] =
    val tokenUrl = s"$keycloakUrl/realms/$realm/protocol/openid-connect/token"
    val request = basicRequest
      .post(uri"$tokenUrl")
      .body(form)
      .header("Content-Type", "application/x-www-form-urlencoded")
      .response(asStringAlways)

    val responseOrError = sendRequest(request)
    responseOrError.flatMap(response =>
      val body = response.body
      response.code match
        case StatusCode.Ok           => Right(body)
        case StatusCode.BadRequest   => Left(s"Bad request: $body")
        case StatusCode.Unauthorized => Left(s"Invalid credentials: $body")
        case StatusCode.Forbidden    => Left(s"Client not allowed: $body")
        case other                   => Left(s"Unexpected Keycloak status: $other")
    )

  def requestAccessToken(form: Map[String, String]): Either[String, String] =
    sendTokenRequest(form).flatMap(body =>
      parseJson(body).flatMap(json =>
        json.hcursor.get[String]("access_token").left.map(err => s"Missing access_token: ${err.getMessage}")
      )
    )

  def getClientAccessToken(): Either[String, String] =
    requestAccessToken(
      Map(
        "grant_type"    -> "client_credentials",
        "client_id"     -> clientId,
        "client_secret" -> clientSecret
      )
    )

  def createUser(username: String, email: String, password: String): Either[String, (String, String)] =
    getClientAccessToken().flatMap(token =>
      val userId = UUID.randomUUID().toString()
      val jsonBody = s"""
          {
            "username": "$username",
            "email": "$email",
            "enabled": true,
            "credentials": [
              {
                "type": "password",
                "value": "$password",
                "temporary": false
              }
            ],
            "attributes": {
              "custom_user_id": ["$userId"]
            }
          }
        """

      val request = basicRequest
        .post(uri"$keycloakUrl/admin/realms/$realm/users")
        .body(jsonBody)
        .header("Content-Type", "application/json")
        .header("Authorization", s"Bearer $token")

      val responseOrError = sendRequest(request)
      responseOrError.flatMap(response =>
        if response.code == StatusCode.Created then
          response.header("Location") match
            case Some(location) =>
              val keycloakId = location.split("/").last
              Right(keycloakId, userId)
            case None =>
              Left("User created but could not retrieve ID from Keycloak")
        else
          Left(s"Failed to create user on Keycloak: ${response.code} ${response.body}")
      )
    )

  def deleteUser(userId: String): Either[String, Unit] =
    getClientAccessToken().flatMap(token =>
      val request = basicRequest
        .delete(uri"$keycloakUrl/admin/realms/$realm/users/$userId")
        .header("Authorization", s"Bearer $token")

      val responseOrError = sendRequest(request)
      responseOrError.flatMap(response =>
        if response.code == StatusCode.NoContent then
          Right(())
        else
          Left(s"Failed to delete user $userId: ${response.code} ${response.body}")
      )
    )

  def getRoles(): Either[String, String] =
    getClientAccessToken() match
      case Left(err) => Left(s"Cannot get access token: $err")
      case Right(token) =>
        val request = basicRequest
          .get(uri"$keycloakUrl/admin/realms/$realm/roles")
          .header("Authorization", s"Bearer $token")
          .header("Content-Type", "application/json")

        val responseOrError = sendRequest(request)
        responseOrError.flatMap(response =>
          response.code match
            case StatusCode.Ok =>
              response.body match
                case Right(body) =>
                  Right(body)
                case Left(err) => Left(s"Error reading body: $err")
            case other =>
              Left(s"Failed to fetch roles: ${other.code} ${response.body}")
        )

  def assignRoleToUser(keycloakId: String, roleId: String, roleName: String): Either[String, Unit] =
    getClientAccessToken() match
      case Left(err) => Left(s"Cannot get access token: $err")
      case Right(token) =>
        val body = List(Json.obj(
          "id"   -> Json.fromString(roleId),
          "name" -> Json.fromString(roleName)
        )).asJson.noSpaces

        val request = basicRequest
          .post(uri"${keycloakUrl}/admin/realms/${realm}/users/$keycloakId/role-mappings/realm")
          .header("Authorization", s"Bearer $token")
          .header("Content-Type", "application/json")
          .body(body)

        val responseOrError = sendRequest(request)
        responseOrError.flatMap(response =>
          response.code match
            case StatusCode.NoContent =>
              Right(())
            case other =>
              Left(s"Failed to assign role '$roleName' to user '$keycloakId': ${other.code} ${response.body}")
        )

  def parseUserTokens(json: Json, fallbackRefresh: Option[String]): Either[String, UserTokens] =
    for
      accessToken <-
        json.hcursor.get[String]("access_token").left.map(err => s"Missing access_token: ${err.getMessage}")
      refreshToken <- json.hcursor.get[String]("refresh_token")
        .left.map(_ => "Missing refresh_token")
        .orElse(fallbackRefresh.toRight("Missing refresh_token"))
      expiresIn <-
        json.hcursor.get[Long]("expires_in").left.map(err => s"Missing expires_in: ${err.getMessage}")
      refreshExpiresIn <-
        json.hcursor.get[Long]("refresh_expires_in").left.map(err => s"Missing refresh_expires_in: ${err.getMessage}")
    yield UserTokens(accessToken, expiresIn, refreshToken, refreshExpiresIn)

  def requestUserTokensForLogin(form: Map[String, String]): Either[String, UserTokens] =
    sendTokenRequest(form).flatMap(body =>
      parseJson(body).flatMap(json =>
        parseUserTokens(json, None)
      )
    )

  def requestUserTokensForRefresh(form: Map[String, String], oldRefreshToken: String): Either[String, UserTokens] =
    sendTokenRequest(form).flatMap(body =>
      parseJson(body).flatMap(json =>
        parseUserTokens(json, Some(oldRefreshToken))
      )
    )

  def loginUser(usernameOrEmail: String, password: String): Either[String, UserTokens] =
    requestUserTokensForLogin(
      Map(
        "grant_type"    -> "password",
        "client_id"     -> clientId,
        "client_secret" -> clientSecret,
        "username"      -> usernameOrEmail,
        "password"      -> password
      )
    )

  def refreshUserTokens(refreshToken: String): Either[String, UserTokens] =
    requestUserTokensForRefresh(
      Map(
        "grant_type"    -> "refresh_token",
        "client_id"     -> clientId,
        "client_secret" -> clientSecret,
        "refresh_token" -> refreshToken
      ),
      refreshToken
    )
