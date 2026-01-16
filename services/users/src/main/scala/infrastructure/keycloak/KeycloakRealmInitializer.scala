package infrastructure.keycloak

import KeycloakRoles.parseAndFilterRoles

class KeycloakRealmInitializer(tokenClient: KeycloakTokenClient, adminApi: KeycloakAdminApi):
  def initializeRoles(): Either[String, Map[String, String]] =
    for
      accessToken   <- tokenClient.getClientAccessToken()
      rolesJson     <- adminApi.getRealmRoles(accessToken)
      filteredRoles <- parseAndFilterRoles(rolesJson)
    yield filteredRoles
