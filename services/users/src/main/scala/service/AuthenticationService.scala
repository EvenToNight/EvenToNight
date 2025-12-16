package service

import infrastructure.KeycloakConnection
import keycloak.KeycloakRoles
import keycloak.KeycloakRoles._

class AuthenticationService(kc: KeycloakConnection):

  KeycloakRoles.initRoles(kc) match
    case Left(err) => println(s"Failed to initialize member and organization roles: $err")
    case Right(_)  => println("Retrieve member and organization roles from Keycloak successfully.")

  def createUserWithRole(username: String, email: String, password: String, roleName: String): Either[String, String] =
    for
      keycloakId <- kc.createUser(username, email, password)
      roleId     <- roleIds.get(roleName).toRight(s"Role '$roleName' not initialized")
      _          <- kc.assignRoleToUser(keycloakId, roleId, roleName)
    yield keycloakId
