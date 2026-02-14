package domain.service

import domain.UserTokens
import domain.ValidRegistration

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
