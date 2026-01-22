package middleware.auth;

case class JwtPayload(user_id: String, exp: Long)

case class AuthUser(userId: String)

case class PublicKeyEntry(kid: String, pem: String)
