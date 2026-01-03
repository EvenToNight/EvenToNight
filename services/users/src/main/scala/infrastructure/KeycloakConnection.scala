package infrastructure

import io.circe.Json
import io.circe.parser.parse
import io.circe.syntax._
import sttp.client3._
import sttp.model.StatusCode

import java.util.UUID

class KeycloakConnection(backend: SttpBackend[Identity, Any], clientSecret: String):
  private val keycloakUrl = sys.env.getOrElse("KEYCLOAK_URL", "http://localhost:8082")
  private val realm       = "eventonight"
  private val clientId    = "users-service"

  private def requestAccessToken(form: Map[String, String]): Either[String, String] =
    val tokenUrl = s"$keycloakUrl/realms/$realm/protocol/openid-connect/token"
    val request = basicRequest
      .post(uri"$tokenUrl")
      .body(form)
      .header("Content-Type", "application/x-www-form-urlencoded")
      .response(asStringAlways)

    val response = request.send(backend)
    val body     = response.body

    response.code match
      case StatusCode.Ok =>
        for
          json  <- parse(body).left.map(err => s"Invalid JSON: ${err.getMessage}")
          token <- json.hcursor.get[String]("access_token").left.map(err => s"Missing access_token: ${err.getMessage}")
        yield token
      case StatusCode.BadRequest =>
        parse(body).left.map(err => s"Invalid JSON: ${err.getMessage}").flatMap(json =>
          json.hcursor.get[String]("error") match
            case Right("invalid_grant") => Left("Invalid credentials")
            case Right(other)           => Left(s"Keycloak error: $other")
            case Left(_)                => Left(s"Keycloak error: $body")
        )
      case StatusCode.Unauthorized => Left(s"Invalid credentials: $body")
      case StatusCode.Forbidden    => Left(s"Client not allowed: $body")
      case other                   => Left(s"Unexpected Keycloak status: $other")

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

      val response = request.send(backend)
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

  def deleteUser(userId: String): Either[String, Unit] =
    getClientAccessToken().flatMap(token =>
      val request = basicRequest
        .delete(uri"$keycloakUrl/admin/realms/$realm/users/$userId")
        .header("Authorization", s"Bearer $token")

      val response = request.send(backend)
      if response.code == StatusCode.NoContent then
        Right(())
      else
        Left(s"Failed to delete user $userId: ${response.code} ${response.body}")
    )

  def getRoles(): Either[String, String] =
    getClientAccessToken() match
      case Left(err) => Left(s"Cannot get access token: $err")
      case Right(token) =>
        val request = basicRequest
          .get(uri"$keycloakUrl/admin/realms/$realm/roles")
          .header("Authorization", s"Bearer $token")
          .header("Content-Type", "application/json")

        val response = request.send(backend)
        response.code match
          case StatusCode.Ok =>
            response.body match
              case Right(body) =>
                Right(body)
              case Left(err) => Left(s"Error reading body: $err")
          case other =>
            Left(s"Failed to fetch roles: ${other.code} ${response.body}")

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

        val response = request.send(backend)
        response.code match
          case StatusCode.NoContent =>
            Right(())
          case other =>
            Left(s"Failed to assign role '$roleName' to user '$keycloakId': ${other.code} ${response.body}")

  def loginUser(usernameOrEmail: String, password: String): Either[String, String] =
    requestAccessToken(
      Map(
        "grant_type"    -> "password",
        "client_id"     -> clientId,
        "client_secret" -> clientSecret,
        "username"      -> usernameOrEmail,
        "password"      -> password
      )
    )
