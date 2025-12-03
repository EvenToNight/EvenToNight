package infrastructure

import io.circe.parser.parse
import sttp.client3._

class KeycloakConnection(backend: SttpBackend[Identity, Any], clientSecret: String):
  val keycloakUrl = "http://localhost:8080"
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
