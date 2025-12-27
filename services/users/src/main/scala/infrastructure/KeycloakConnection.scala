package infrastructure

import io.circe.Json
import io.circe.parser.parse
import io.circe.syntax._
import sttp.client3._
import sttp.model.StatusCode

import java.util.UUID

class KeycloakConnection(backend: SttpBackend[Identity, Any], clientSecret: String):
  val keycloakUrl = sys.env.getOrElse("KEYCLOAK_URL", "http://localhost:8082")
  val realm       = "eventonight"
  val clientId    = "users-service"

  def getAccessToken() =
    val tokenUrl = s"$keycloakUrl/realms/$realm/protocol/openid-connect/token"
    val request = basicRequest
      .post(uri"$tokenUrl")
      .body(
        Map(
          "grant_type"    -> "client_credentials",
          "client_id"     -> clientId,
          "client_secret" -> clientSecret
        )
      )
      .header("Content-Type", "application/x-www-form-urlencoded")

    val response = request.send(backend)
    for
      body  <- response.body.left.map(err => s"Keycloak error: $err")
      json  <- parse(body).left.map(err => s"Invalid JSON: ${err.getMessage}")
      token <- json.hcursor.get[String]("access_token").left.map(err => s"Missing access_token: ${err.getMessage}")
    yield token

  def createUser(username: String, email: String, password: String): Either[String, (String, String)] =
    getAccessToken().flatMap(token =>
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
    getAccessToken().flatMap(token =>
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
    getAccessToken() match
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
    getAccessToken() match
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
