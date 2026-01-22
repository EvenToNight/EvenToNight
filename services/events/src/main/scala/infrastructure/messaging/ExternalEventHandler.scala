package infrastructure.messaging

import domain.models.UserMetadata
import infrastructure.db.MongoUserMetadataRepository
import infrastructure.messaging.MessageHandler
import io.circe.generic.auto.*
import io.circe.parser.*

case class EventEnvelope(
    eventType: String,
    occurredAt: String,
    payload: io.circe.Json
)

case class UserCreatedEvent(id: String, role: String)

case class UserDeletedEvent(id: String)

class ExternalEventHandler(userMetadataRepo: MongoUserMetadataRepository) extends MessageHandler:

  override def handle(routingKey: String, message: String): Unit =
    routingKey match
      case "user.created" => handleUserCreated(message)
      case "user.deleted" => handleUserDeleted(message)
      case _              => println(s"[HANDLER] ⚠️ Unknown routing key: $routingKey")

  private def handleUserCreated(message: String): Unit =

    decode[EventEnvelope](message) match
      case Right(envelope) =>
        envelope.payload.as[UserCreatedEvent] match
          case Right(event) =>
            val userMetadata = UserMetadata(id = event.id, role = event.role)
            userMetadataRepo.save(userMetadata)
          case Left(error) =>
            println(s"[HANDLER] ❌ Error parsing payload: ${error.getMessage}")
            println(s"[HANDLER]    Raw payload: ${envelope.payload}")
      case Left(error) =>
        println(s"[HANDLER] ❌ Error parsing envelope: ${error.getMessage}")

  private def handleUserDeleted(message: String): Unit =

    decode[EventEnvelope](message) match
      case Right(envelope) =>
        envelope.payload.as[UserDeletedEvent] match
          case Right(event) =>
            userMetadataRepo.delete(event.id)
          case Left(error) =>
            println(s"[HANDLER] ❌ Error parsing payload: ${error.getMessage}")
            println(s"[HANDLER]    Raw payload: ${envelope.payload}")
      case Left(error) =>
        println(s"[HANDLER] ❌ Error parsing envelope: ${error.getMessage}")
