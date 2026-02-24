package domain.valueobjects

import java.util.UUID

opaque type EventId = String

object EventId:

  def generate(): EventId = UUID.randomUUID().toString

  def apply(value: String): Either[String, EventId] =
    if value == null || value.trim.isEmpty then
      Left("EventId cannot be null or empty")
    else
      Right(value)

  def unsafe(value: String): EventId = value

  extension (id: EventId)
    def value: String    = id
    def asString: String = id
