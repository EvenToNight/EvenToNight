package domain.service

import cask.FormFile

trait MediaService:
  def uploadAvatar(userId: String, avatarOpt: Option[FormFile]): String
  def deleteAvatar(userId: String): Either[String, Unit]
