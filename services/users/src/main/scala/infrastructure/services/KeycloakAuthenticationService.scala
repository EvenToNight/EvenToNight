package infrastructure.services

import application.registration.ValidRegistration
import domain.service.AuthenticationService
import infrastructure.keycloak._

class KeycloakAuthenticationService(
    keycloakTokenClient: KeycloakTokenClient,
    keycloakAdminApi: KeycloakAdminApi,
    roleIds: Map[String, String]
) extends AuthenticationService:
  override def createUserWithRole(registration: ValidRegistration) =
    for
      accessToken <- keycloakTokenClient.getClientAccessToken()
      (keycloakId, userId) <-
        keycloakAdminApi.createUser(accessToken, registration.username, registration.email, registration.password)
      roleId <- roleIds.get(registration.role).toRight(s"Role '${registration.role}' not initialized")
      _      <- keycloakAdminApi.assignRealmRoleToUser(accessToken, keycloakId, roleId, registration.role)
    yield userId

  override def login(usernameOrEmail: String, password: String) =
    keycloakTokenClient.loginUser(usernameOrEmail, password)

  override def refresh(refreshToken: String) =
    keycloakTokenClient.refreshUserTokens(refreshToken)

  override def logoutLocal(refreshToken: String) =
    keycloakTokenClient.revokeRefreshToken(refreshToken)

  override def deleteUser(keycloakId: String) =
    for
      adminToken <- keycloakTokenClient.getClientAccessToken()
      _          <- keycloakAdminApi.deleteUser(adminToken, keycloakId)
    yield ()

  override def updatePassword(
      username: String,
      keycloakId: String,
      currentPassword: String,
      newPassword: String
  ) =
    if !keycloakTokenClient.verifyCurrentPassword(username, currentPassword) then
      Left("Current password incorrect")
    else
      for
        adminToken <- keycloakTokenClient.getClientAccessToken()
        _          <- keycloakAdminApi.updatePassword(adminToken, keycloakId, newPassword)
      yield ()
