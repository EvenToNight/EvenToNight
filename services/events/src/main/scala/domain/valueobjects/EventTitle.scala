package domain.valueobjects

opaque type EventTitle = String

object EventTitle:

  private val MinLength = 3
  private val MaxLength = 200

  def apply(value: String): Either[String, EventTitle] =
    if value == null || value.trim.isEmpty then
      Left("Event title cannot be empty")
    else if value.trim.length < MinLength then
      Left(s"Event title must be at least $MinLength characters long")
    else if value.length > MaxLength then
      Left(s"Event title must not exceed $MaxLength characters")
    else
      Right(value.trim)

  def unsafe(value: String): EventTitle = value

  extension (title: EventTitle)
    def value: String    = title
    def asString: String = title
