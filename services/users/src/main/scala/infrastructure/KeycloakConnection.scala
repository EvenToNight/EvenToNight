package infrastructure

import io.circe.parser.parse
import sttp.client3._
import sttp.model.StatusCode

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

  def createUser(username: String, email: String, password: String) =
    getAccessToken().flatMap(token =>
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
            ]
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
            val id = location.split("/").last
            Right(id)
          case None =>
            Left("User created but could not retrieve ID from Keycloak")
      else
        Left(s"Failed to create user on Keycloak: ${response.code} ${response.body}")
    )
