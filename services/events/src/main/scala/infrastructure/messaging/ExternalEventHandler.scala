package infrastructure.messaging

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

class ExternalEventHandler(userMetadataRepo: MongoUserMetadataRepository) extends MessageHandler:

  override def handle(routingKey: String, message: String): Unit =
    println("connected with " + userMetadataRepo)
    routingKey match
      case "user.created" => handleUserCreated(message)
      case _              => println(s"[HANDLER] ⚠️ Unknown routing key: $routingKey")

  private def handleUserCreated(message: String): Unit =

    decode[EventEnvelope](message) match
      case Right(envelope) =>
        envelope.payload.as[UserCreatedEvent] match
          case Right(event) =>
            println(s"[HANDLER] 👤 User created: (${event.id})")
            println(s"[HANDLER]    Role: ${event.role}")
          case Left(error) =>
            println(s"[HANDLER] ❌ Error parsing payload: ${error.getMessage}")
            println(s"[HANDLER]    Raw payload: ${envelope.payload}")
      case Left(error) =>
        println(s"[HANDLER] ❌ Error parsing envelope: ${error.getMessage}")
