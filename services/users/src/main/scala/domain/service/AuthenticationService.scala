package domain.service

import application.dto.UserTokens
import application.registration.ValidRegistration

trait AuthenticationService:
  def createUserWithRole(registration: ValidRegistration): Either[String, String]
  def login(usernameOrEmail: String, password: String): Either[String, UserTokens]
  def refresh(refreshToken: String): Either[String, UserTokens]
  def logoutLocal(refreshToken: String): Either[String, Unit]
  def deleteUser(keycloakId: String): Either[String, Unit]
  def updatePassword(
      username: String,
      keycloakId: String,
      currentPassword: String,
      newPassword: String
  ): Either[String, Unit]
