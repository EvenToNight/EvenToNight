package http

import cask.Request
import infrastructure.keycloak.KeycloakJwtVerifier.authorizeUser
import infrastructure.keycloak.KeycloakJwtVerifier.verifyToken

object HttpSecurity:
  def authenticateAndAuthorize(request: Request, userId: String): Either[String, Unit] =
    for
      userAccessToken <- AuthHeaderExtractor.extractBearer(request)
      payload         <- verifyToken(userAccessToken)
      _               <- authorizeUser(payload, userId)
    yield ()
