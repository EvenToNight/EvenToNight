package middleware.auth

object CurrentUser {
  def apply(user: AuthUser): AuthUser = user
  
  def userId(user: AuthUser): String = user.userId
}