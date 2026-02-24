package presentation.http.dto.response.query

import io.circe.Encoder
import io.circe.generic.semiauto._

case class PaginatedResponseDTO[T](
    data: Seq[T],
    limit: Int,
    offset: Int,
    hasMore: Boolean
)

object PaginatedResponse:
  given [T: Encoder]: Encoder[PaginatedResponseDTO[T]] =
    deriveEncoder[PaginatedResponseDTO[T]].mapJson(_.dropNullValues)
