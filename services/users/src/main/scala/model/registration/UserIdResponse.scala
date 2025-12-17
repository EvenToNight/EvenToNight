package model.registration

import upickle.default.Writer
import upickle.default.macroW

case class UserIdResponse(id: String)

object UserIdResponse:
  given Writer[UserIdResponse] = macroW
