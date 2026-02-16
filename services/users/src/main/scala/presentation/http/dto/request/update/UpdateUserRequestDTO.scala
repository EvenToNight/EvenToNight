package presentation.http.dto.request.update

import io.circe.Decoder
import io.circe.generic.semiauto._

case class UpdateUserRequestDTO(
    accountDTO: Option[UpdateAccountDTO] = None,
    profileDTO: Option[UpdateProfileDTO] = None
)

object UpdateUserRequestDTO:
  import UpdateAccountDTO.given
  import UpdateProfileDTO.given
  given Decoder[UpdateUserRequestDTO] = deriveDecoder
