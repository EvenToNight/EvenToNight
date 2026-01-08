package model.api.dto

import model.api.dto.AccountDTO
import model.api.dto.ProfileDTO
import upickle.default.Writer
import upickle.default.macroW

case class LoginResponseDTO(accessToken: String, refreshToken: String, account: AccountDTO, profile: ProfileDTO)

object LoginResponseDTO:
  import AccountDTO.given
  import ProfileDTO.given
  given Writer[LoginResponseDTO] = macroW
