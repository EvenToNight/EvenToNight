package infrastructure.keycloak

import sttp.client3._
import sttp.model.Uri

object KeycloakConfig:
  private val baseUrl: String = sys.env.getOrElse("KEYCLOAK_URL", "http://localhost:8082")
  private val realm: String   = "eventonight"
  val oidcBaseUri: Uri        = uri"${baseUrl}".addPath("realms", realm, "protocol", "openid-connect")
  val adminRealmUri: Uri      = uri"${baseUrl}".addPath("admin", "realms", realm)
  val adminUsersUri: Uri      = adminRealmUri.addPath("users")
