package model.registration

import upickle.default.Reader
import upickle.default.macroR

case class RegistrationRequest(
    userType: String,
    username: String,
    email: String,
    password: String
)

object RegistrationRequest:
  given Reader[RegistrationRequest] = macroR
