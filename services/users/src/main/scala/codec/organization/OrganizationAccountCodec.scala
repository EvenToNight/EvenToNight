package codec.organization

import model.organization.OrganizationAccount
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

import scala.collection.mutable.ListBuffer

class OrganizationAccountCodec extends Codec[OrganizationAccount]:
  override def encode(writer: BsonWriter, value: OrganizationAccount, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("username", value.username)
    writer.writeString("email", value.email)
    writer.writeBoolean("darkMode", value.darkMode)
    writer.writeString("language", value.language)
    value.interests.foreach(list =>
      writer.writeStartArray("interests")
      list.foreach(writer.writeString)
      writer.writeEndArray()
    )
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationAccount =
    var username: String                = null
    var email: String                   = null
    var darkMode: Boolean               = false
    var language: String                = "en"
    var interests: Option[List[String]] = None

    reader.readStartDocument()
    while (reader.readBsonType() != BsonType.END_OF_DOCUMENT) {
      reader.readName() match
        case "_id" =>
          reader.skipValue()
        case "username" =>
          username = reader.readString()
        case "email" =>
          email = reader.readString()
        case "darkMode" =>
          darkMode = reader.readBoolean()
        case "language" =>
          language = reader.readString()
        case "interests" =>
          val buffer = ListBuffer.empty[String]
          reader.readStartArray()
          while (reader.readBsonType() != BsonType.END_OF_DOCUMENT) {
            buffer += reader.readString()
          }
          reader.readEndArray()
          interests = Some(buffer.toList)
        case _ =>
          reader.skipValue()
    }

    reader.readEndDocument()

    OrganizationAccount(
      username = username,
      email = email,
      darkMode = darkMode,
      language = language,
      interests = interests
    )

  override def getEncoderClass: Class[OrganizationAccount] = classOf[OrganizationAccount]
