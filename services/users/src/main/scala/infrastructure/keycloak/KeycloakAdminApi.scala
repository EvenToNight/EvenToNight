package infrastructure.keycloak

import io.circe.Json
import io.circe.parser.parse
import io.circe.syntax._
import sttp.client3._
import sttp.model.StatusCode

import java.util.UUID

import KeycloakConfig._

class KeycloakAdminApi(connection: KeycloakConnection):
  def createUser(token: String, username: String, email: String, password: String): Either[String, (String, String)] =
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

    val createUserUri = adminUsersUri
    val request = basicRequest
      .post(createUserUri)
      .body(jsonBody)
      .header("Content-Type", "application/json")
      .header("Authorization", s"Bearer $token")

    val passwordKeywords = Seq("length", "lowercase", "digit", "special")
    val responseOrError  = connection.sendRequest(request)
    responseOrError.flatMap(response =>
      if response.code == StatusCode.Created then
        response.header("Location") match
          case Some(location) =>
            val keycloakId = location.split("/").last
            Right(keycloakId, userId)
          case None =>
            Left("User created but could not retrieve ID from Keycloak")
      else
        val bodyString = response.body.fold(identity, identity)
        parse(bodyString) match
          case Right(json) =>
            val errMsg = json.hcursor.downField("error_description").as[String].getOrElse("Unknown error")
            if passwordKeywords.exists(kw => errMsg.toLowerCase.contains(kw)) then
              Left(s"Password not compliant: $errMsg")
            else
              Left(s"User creation rejected: $errMsg")
          case Left(_) =>
            Left(s"Failed to parse Keycloak response: $bodyString")
    )

  def deleteUser(adminToken: String, keycloakId: String): Either[String, Unit] =
    val deleteUserUri = adminUsersUri.addPath(keycloakId)
    val request = basicRequest
      .delete(deleteUserUri)
      .header("Authorization", s"Bearer $adminToken")

    val responseOrError = connection.sendRequest(request)
    responseOrError.flatMap(response =>
      response.code match
        case StatusCode.NoContent    => Right(())
        case StatusCode.NotFound     => Left("User not found")
        case StatusCode.Unauthorized => Left(s"Unauthorized on Keycloak: ${response.body}")
        case StatusCode.Forbidden    => Left("Insufficient permissions in Keycloak")
        case _                       => Left(s"Failed to delete user on Keycloak: ${response.code} ${response.body}")
    )

  def getRealmRoles(token: String): Either[String, String] =
    val getRolesUri = adminRealmUri.addPath("roles")
    val request = basicRequest
      .get(getRolesUri)
      .header("Authorization", s"Bearer $token")
      .header("Content-Type", "application/json")

    val responseOrError = connection.sendRequest(request)
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

  def assignRealmRoleToUser(token: String, keycloakId: String, roleId: String, roleName: String): Either[String, Unit] =
    val body = List(Json.obj(
      "id"   -> Json.fromString(roleId),
      "name" -> Json.fromString(roleName)
    )).asJson.noSpaces

    val roleMappingUri = adminUsersUri.addPath(keycloakId, "role-mappings", "realm")
    val request = basicRequest
      .post(roleMappingUri)
      .header("Authorization", s"Bearer $token")
      .header("Content-Type", "application/json")
      .body(body)

    val responseOrError = connection.sendRequest(request)
    responseOrError.flatMap(response =>
      response.code match
        case StatusCode.NoContent =>
          Right(())
        case other =>
          Left(s"Failed to assign role '$roleName' to user '$keycloakId': ${other.code} ${response.body}")
    )

  def updatePassword(adminToken: String, keycloakId: String, newPassword: String): Either[String, Unit] =
    val updatePwsUri = adminUsersUri.addPath(keycloakId, "reset-password")
    val body = Json.obj(
      "type"      -> Json.fromString("password"),
      "value"     -> Json.fromString(newPassword),
      "temporary" -> Json.fromBoolean(false)
    ).noSpaces

    val request = basicRequest
      .put(updatePwsUri)
      .header("Authorization", s"Bearer $adminToken")
      .header("Content-Type", "application/json")
      .body(body)

    val responseOrError = connection.sendRequest(request)
    responseOrError.flatMap(response =>
      response.code match
        case StatusCode.NoContent    => Right(())
        case StatusCode.BadRequest   => Left(s"Invalid password: ${response.body}")
        case StatusCode.Unauthorized => Left("Unauthorized on Keycloak")
        case StatusCode.Forbidden    => Left("Insufficient permissions in Keycloak")
        case StatusCode.NotFound     => Left("User not found in Keycloak")
        case _ => Left(s"Failed to update password on Keycloak: ${response.code} ${response.body}")
    )
