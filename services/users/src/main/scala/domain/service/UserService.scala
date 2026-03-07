package domain.service

import domain.aggregates.RegisteredUser

trait UserService:
  def insertUser(user: RegisteredUser, userId: String): Either[String, Unit]
  def getUsers(): Either[String, List[(String, String, RegisteredUser)]]
  def getUserById(userId: String): Either[String, (String, RegisteredUser)]
  def deleteUser(userId: String): Either[String, Unit]
  def updateUser(updatedUser: RegisteredUser, userId: String): Either[String, Unit]
  def updateAvatar(userId: String, avatar: String): Either[String, RegisteredUser]
