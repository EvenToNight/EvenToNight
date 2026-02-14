package domain

case class UserTokens(accessToken: String, expiresIn: Long, refreshToken: String, refreshExpiresIn: Long)
