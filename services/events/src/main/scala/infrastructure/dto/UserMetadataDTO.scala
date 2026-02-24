package infrastructure.dto

case class UserMetadata(
    id: String,
    role: String,
    name: String
)

object UserMetadata:
  import org.bson.Document

  extension (user: UserMetadata)
    def toDocument: Document =
      val doc = new Document().append("_id", user.id)
      doc.append("role", user.role)
      doc.append("name", user.name)
      doc

  def fromDocument(doc: Document): UserMetadata =
    UserMetadata(
      id = doc.getString("_id"),
      role = doc.getString("role"),
      name = doc.getString("name")
    )
