package model.api.dto

import upickle.default.Writer
import upickle.default.macroW

case class ProfileDTO(name: String)

object ProfileDTO:
  given Writer[ProfileDTO] = macroW
