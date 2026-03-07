package presentation.http.security

import cask.Request
import infrastructure.keycloak.KeycloakJwtVerifier.authorizeUser
import infrastructure.keycloak.KeycloakJwtVerifier.verifyToken
import pdi.jwt.JwtClaim
import presentation.http.utils.AuthHeaderExtractor

object HttpSecurity:
  def authenticateAndAuthorize(request: Request, userId: String): Either[String, JwtClaim] =
    for
      userAccessToken <- AuthHeaderExtractor.extractBearer(request)
      payload         <- verifyToken(userAccessToken)
      _               <- authorizeUser(payload, userId)
    yield payload
