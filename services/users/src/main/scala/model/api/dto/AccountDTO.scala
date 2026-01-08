package model.api.dto

import upickle.default.Writer
import upickle.default.macroW

case class AccountDTO(username: String, email: String)

object AccountDTO:
  given Writer[AccountDTO] = macroW
