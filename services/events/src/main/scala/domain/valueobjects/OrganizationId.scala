package domain.valueobjects

opaque type OrganizationId = String

object OrganizationId:

  def apply(value: String): Either[String, OrganizationId] =
    if value == null || value.trim.isEmpty then
      Left("OrganizationId cannot be null or empty")
    else
      Right(value)

  def unsafe(value: String): OrganizationId = value

  extension (id: OrganizationId)
    def value: String    = id
    def asString: String = id
