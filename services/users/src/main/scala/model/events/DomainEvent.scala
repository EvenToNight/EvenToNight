package model.events

sealed trait DomainEvent

trait UserData:
  def id: String
  def username: String
  def name: String
  def email: String
  def avatar: String
  def bio: Option[String]
  def interests: Option[List[String]]
  def language: String

case class UserCreated(
    id: String,
    username: String,
    name: String,
    email: String,
    avatar: String,
    bio: Option[String],
    interests: Option[List[String]],
    language: String
) extends UserData with DomainEvent

case class UserUpdated(
    id: String,
    username: String,
    name: String,
    email: String,
    avatar: String,
    bio: Option[String],
    interests: Option[List[String]],
    language: String
) extends UserData with DomainEvent
