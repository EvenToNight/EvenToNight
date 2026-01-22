package infrastructure.messaging

import infrastructure.messaging.MessageHandler
import io.circe.generic.auto.*
import io.circe.parser.*

case class UserCreatedEvent(id: String, role: String)

class ExternalEventHandler extends MessageHandler:

  override def handle(routingKey: String, message: String): Unit =
    routingKey match
      case "user.created" => handleUserCreated(message)
      case _              => println(s"[HANDLER] ⚠️ Unknown routing key: $routingKey")

  private def handleUserCreated(message: String): Unit =
    decode[UserCreatedEvent](message) match
      case Right(event) =>
        println(s"[HANDLER] 👤 User created: ${event.id} with role ${event.role}")
      case Left(error) =>
        println(s"[HANDLER] ❌ Error parsing user.created: ${error.getMessage}")
