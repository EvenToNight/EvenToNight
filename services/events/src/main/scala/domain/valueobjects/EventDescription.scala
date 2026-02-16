package domain.valueobjects

opaque type EventDescription = String

object EventDescription:

  private val MaxLength = 5000

  def apply(value: String): Either[String, EventDescription] =
    if value == null then
      Left("Event description cannot be null")
    else if value.length > MaxLength then
      Left(s"Event description must not exceed $MaxLength characters")
    else
      Right(value.trim)

  def unsafe(value: String): EventDescription = value

  extension (description: EventDescription)
    def value: String    = description
    def asString: String = description
