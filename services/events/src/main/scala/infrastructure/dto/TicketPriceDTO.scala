package infrastructure.dto

case class TicketPrice(
    eventId: String,
    ticketTypeId: String,
    price: Double
)

object TicketPrice:
  import org.bson.Document

  extension (ticketPrice: TicketPrice)
    def toDocument: Document =
      val doc = new Document()
      doc.append("eventId", ticketPrice.eventId)
      doc.append("ticketTypeId", ticketPrice.ticketTypeId)
      doc.append("price", ticketPrice.price)
      doc

  def fromDocument(doc: Document): TicketPrice =
    TicketPrice(
      eventId = doc.getString("eventId"),
      ticketTypeId = doc.getString("ticketTypeId"),
      price = doc.getDouble("price")
    )
