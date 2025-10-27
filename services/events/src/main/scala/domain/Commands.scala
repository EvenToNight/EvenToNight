package domain
import java.time.LocalDateTime

object Commands:

  case class CreateEventDraftCommand(
      title: String,
      description: String,
      poster: String,
      tag: Tag,
      location: String,
      date: LocalDateTime,
      id_creator: String,
      id_collaborator: Option[String]
  )
