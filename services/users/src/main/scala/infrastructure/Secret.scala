package infrastructure

import io.github.cdimascio.dotenv.Dotenv

// scalafix:off DisableSyntax.throw
object Secret:
  private val dotenv: Dotenv = Dotenv.configure().directory(".").load()
  val usersServiceSecret: String =
    sys.env.getOrElse(
      "USERS_SERVICE_SECRET",
      Option(dotenv.get("USERS_SERVICE_SECRET"))
        .getOrElse(throw new RuntimeException("USERS_SERVICE_SECRET must be defined"))
    )
