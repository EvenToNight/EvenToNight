package api.dto.response.query

import io.circe.Encoder
import io.circe.generic.semiauto._

case class PaginatedResponse[T](
    data: Seq[T],
    limit: Int,
    offset: Int,
    hasMore: Boolean
)

object PaginatedResponse:
  given [T: Encoder]: Encoder[PaginatedResponse[T]] = deriveEncoder[PaginatedResponse[T]].mapJson(_.dropNullValues)
