package service

import infrastructure.keycloak._
import model.UserTokens
import model.ValidRegistration

class AuthenticationService(
    keycloakTokenClient: KeycloakTokenClient,
    adminApi: KeycloakAdminApi,
    roleIds: Map[String, String]
):
  def createUserWithRole(registration: ValidRegistration): Either[String, String] =
    for
      accessToken <- keycloakTokenClient.getClientAccessToken()
      (keycloakId, userId) <-
        adminApi.createUser(accessToken, registration.username, registration.email, registration.password)
      roleId <- roleIds.get(registration.userType).toRight(s"Role '${registration.userType}' not initialized")
      _      <- adminApi.assignRealmRoleToUser(accessToken, keycloakId, roleId, registration.userType)
    yield userId

  def login(usernameOrEmail: String, password: String): Either[String, UserTokens] =
    keycloakTokenClient.loginUser(usernameOrEmail, password)

  def refresh(refreshToken: String): Either[String, UserTokens] =
    keycloakTokenClient.refreshUserTokens(refreshToken)
