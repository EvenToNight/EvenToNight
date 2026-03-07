package presentation.http.dto.request.query

case class SearchUsersQueryDTO(
    role: Option[String],
    prefix: Option[String],
    limit: Option[Int],
    offset: Option[Int]
)
