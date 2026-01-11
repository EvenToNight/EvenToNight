package model

import upickle.default.Writer
import upickle.default.macroW

case class UserTokens(accessToken: String, expiresIn: Long, refreshToken: String, refreshExpiresIn: Long)

object UserTokens:
  given Writer[UserTokens] = macroW
