package service

import infrastructure.KeycloakConnection
import keycloak.KeycloakRoles
import keycloak.KeycloakRoles._
import model.UserTokens
import model.ValidRegistration

class AuthenticationService(kc: KeycloakConnection):

  KeycloakRoles.initRoles(kc) match
    case Left(err) => println(s"Failed to initialize member and organization roles: $err")
    case Right(_)  => println("Retrieve member and organization roles from Keycloak successfully.")

  def createUserWithRole(registration: ValidRegistration): Either[String, String] =
    for
      (keycloakId, userId) <- kc.createUser(registration.username, registration.email, registration.password)
      roleId <- roleIds.get(registration.userType).toRight(s"Role '${registration.userType}' not initialized")
      _      <- kc.assignRoleToUser(keycloakId, roleId, registration.userType)
    yield userId

  def login(usernameOrEmail: String, password: String): Either[String, UserTokens] =
    kc.loginUser(usernameOrEmail, password)

  def refresh(refreshToken: String): Either[String, UserTokens] =
    kc.refreshUserTokens(refreshToken)
