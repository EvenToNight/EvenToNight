package model.events
import io.circe.Encoder
import io.circe.generic.semiauto._

sealed trait DomainEvent

object DomainEvent:
  implicit val encoder: Encoder[DomainEvent] = Encoder.instance {
    case event: UserCreated => deriveEncoder[UserCreated].apply(event)
    case event: UserUpdated => deriveEncoder[UserUpdated].apply(event)
    case event: UserDeleted => deriveEncoder[UserDeleted].apply(event)
  }

trait UserData:
  def id: String
  def username: String
  def name: String
  def email: String
  def avatar: String
  def bio: Option[String]
  def interests: Option[List[String]]
  def language: String
  def role: String

case class UserCreated(
    id: String,
    username: String,
    name: String,
    email: String,
    avatar: String,
    bio: Option[String],
    interests: Option[List[String]],
    language: String,
    role: String
) extends UserData with DomainEvent

case class UserUpdated(
    id: String,
    username: String,
    name: String,
    email: String,
    avatar: String,
    bio: Option[String],
    interests: Option[List[String]],
    language: String,
    role: String
) extends UserData with DomainEvent

case class UserDeleted(id: String) extends DomainEvent
