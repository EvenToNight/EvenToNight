package infrastructure.keycloak

import sttp.client3._
import sttp.model.StatusCode

import KeycloakConfig.oidcBaseUri

class KeycloakConnection(backend: SttpBackend[Identity, Any]):
  def sendRequest[T](request: Request[T, Any]): Either[String, Response[T]] =
    try Right(request.send(backend))
    catch case e: Exception => Left(s"Connection error: ${e.getMessage}")

  def sendTokenRequest(form: Map[String, String]): Either[String, String] =
    val tokenUri = oidcBaseUri.addPath("token")
    val request = basicRequest
      .post(tokenUri)
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

  def sendLogoutRequest(form: Map[String, String]): Either[String, Unit] =
    val logoutUri = oidcBaseUri.addPath("logout")
    val request = basicRequest
      .post(logoutUri)
      .body(form)
      .header("Content-Type", "application/x-www-form-urlencoded")
      .response(asStringAlways)

    val responseOrError = sendRequest(request)
    responseOrError.flatMap(response =>
      response.code match
        case StatusCode.NoContent  => Right(())
        case StatusCode.BadRequest => Left("Invalid refresh token")
        case _                     => Left(s"Failed to revoke refresh token: ${response.body}")
    )
