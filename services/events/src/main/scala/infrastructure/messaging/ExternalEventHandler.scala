package infrastructure.messaging

import infrastructure.db.{MongoPriceRepository, MongoUserMetadataRepository}
import infrastructure.dto.{TicketPrice, UserMetadata}
import infrastructure.messaging.MessageHandler
import io.circe.generic.auto.*
import io.circe.parser.*

case class EventEnvelope(
    eventType: String,
    occurredAt: String,
    payload: io.circe.Json
)

case class UserCreatedEvent(id: String, role: String, name: String)

case class UserDeletedEvent(id: String)

case class TicketTypeCreatedPayload(eventId: String, ticketTypeId: String, price: Double)

case class TicketTypeUpdatedPayload(ticketTypeId: String, price: Double)

case class TicketTypeDeletedPayload(ticketTypeId: String)

class ExternalEventHandler(
    userMetadataRepo: MongoUserMetadataRepository,
    priceRepo: MongoPriceRepository,
    eventRepo: infrastructure.db.MongoEventRepository
) extends MessageHandler:

  override def handle(routingKey: String, message: String): Unit =
    routingKey match
      case "user.created"        => handleUserCreated(message)
      case "user.deleted"        => handleUserDeleted(message)
      case "ticket-type.created" => handleTicketTypeCreated(message)
      case "ticket-type.updated" => handleTicketTypeUpdated(message)
      case "ticket-type.deleted" => handleTicketTypeDeleted(message)
      case _                     => println(s"[HANDLER] ⚠️ Unknown routing key: $routingKey")

  private def handleUserCreated(message: String): Unit =

    decode[EventEnvelope](message) match
      case Right(envelope) =>
        envelope.payload.as[UserCreatedEvent] match
          case Right(event) =>
            val userMetadata = UserMetadata(id = event.id, role = event.role, name = event.name)
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

  private def handleTicketTypeCreated(message: String): Unit =

    decode[EventEnvelope](message) match
      case Right(envelope) =>
        envelope.payload.as[TicketTypeCreatedPayload] match
          case Right(event) =>
            val ticketPrice = TicketPrice(
              eventId = event.eventId,
              ticketTypeId = event.ticketTypeId,
              price = event.price
            )
            priceRepo.save(ticketPrice)

            eventRepo.findById(event.eventId).foreach { existingEvent =>
              val updatedEvent = existingEvent.copy(isFree = false)
              eventRepo.update(updatedEvent)
            }
          case Left(error) =>
            println(s"[HANDLER] ❌ Error parsing payload: ${error.getMessage}")
            println(s"[HANDLER]    Raw payload: ${envelope.payload}")
      case Left(error) =>
        println(s"[HANDLER] ❌ Error parsing envelope: ${error.getMessage}")

  private def handleTicketTypeUpdated(message: String): Unit =

    decode[EventEnvelope](message) match
      case Right(envelope) =>
        envelope.payload.as[TicketTypeUpdatedPayload] match
          case Right(event) =>
            priceRepo.findByTicketTypeId(event.ticketTypeId) match
              case Some(existingPrice) =>
                val updatedPrice = existingPrice.copy(price = event.price)
                priceRepo.save(updatedPrice)
              case None =>
                println(
                  s"[HANDLER] ⚠️ Cannot update price: TicketPrice not found for ticketTypeId: ${event.ticketTypeId}"
                )
          case Left(error) =>
            println(s"[HANDLER] ❌ Error parsing payload: ${error.getMessage}")
            println(s"[HANDLER]    Raw payload: ${envelope.payload}")
      case Left(error) =>
        println(s"[HANDLER] ❌ Error parsing envelope: ${error.getMessage}")

  private def handleTicketTypeDeleted(message: String): Unit =

    decode[EventEnvelope](message) match
      case Right(envelope) =>
        envelope.payload.as[TicketTypeDeletedPayload] match
          case Right(event) =>
            priceRepo.delete(event.ticketTypeId)
          case Left(error) =>
            println(s"[HANDLER] ❌ Error parsing payload: ${error.getMessage}")
            println(s"[HANDLER]    Raw payload: ${envelope.payload}")
      case Left(error) =>
        println(s"[HANDLER] ❌ Error parsing envelope: ${error.getMessage}")
