package infrastructure

object Secret:
  val usersServiceSecret: String =
    sys.env.getOrElse("USERS_SERVICE_SECRET", "supersecret")
