package infrastructure.keycloak

import sttp.client3._
import sttp.model.StatusCode

class KeycloakConnection(backend: SttpBackend[Identity, Any]):
  private val keycloakBaseUrl = sys.env.getOrElse("KEYCLOAK_URL", "http://localhost:8082")
  private val realm           = "eventonight"

  def baseUrl: String  = keycloakBaseUrl
  def getRealm: String = realm

  def sendRequest[T](request: Request[T, Any]): Either[String, Response[T]] =
    try Right(request.send(backend))
    catch case e: Exception => Left(s"Connection error: ${e.getMessage}")

  def sendTokenRequest(form: Map[String, String]): Either[String, String] =
    val tokenUrl = s"$keycloakBaseUrl/realms/$realm/protocol/openid-connect/token"
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
