package model.registration

import upickle.default.Reader
import upickle.default.macroR

case class RegistrationRequest(
    username: Option[String] = None,
    email: Option[String] = None,
    password: Option[String] = None,
    role: Option[String] = None
)

object RegistrationRequest:
  given Reader[RegistrationRequest] = macroR
