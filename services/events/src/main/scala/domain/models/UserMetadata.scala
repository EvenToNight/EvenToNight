package domain.models

case class UserMetadata(
    id: String,
    role: String
)

object UserMetadata:
  import org.bson.Document

  extension (user: UserMetadata)
    def toDocument: Document =
      val doc = new Document().append("id", user.id)
      doc.append("role", user.role)
      doc

  def fromDocument(doc: Document): UserMetadata =
    UserMetadata(
      id = doc.getString("id"),
      role = doc.getString("role")
    )
