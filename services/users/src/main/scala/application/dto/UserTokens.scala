package application.dto

case class UserTokens(accessToken: String, expiresIn: Long, refreshToken: String, refreshExpiresIn: Long)
