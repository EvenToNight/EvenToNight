package codec.member

import model.member.MemberAccount
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

import java.time.Instant
import scala.collection.mutable.ListBuffer

class MemberAccountCodec extends Codec[MemberAccount]:
  override def encode(writer: BsonWriter, value: MemberAccount, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("username", value.username)
    writer.writeString("email", value.email)
    writer.writeBoolean("darkMode", value.darkMode)
    writer.writeString("language", value.language)
    value.gender.foreach(g =>
      writer.writeString("gender", g)
    )
    value.birthDate.foreach(bd =>
      writer.writeDateTime("birthDate", bd.toEpochMilli)
    )
    value.interests.foreach(list =>
      writer.writeStartArray("interests")
      list.foreach(writer.writeString)
      writer.writeEndArray()
    )
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): MemberAccount =
    var username: String                = null
    var email: String                   = null
    var darkMode: Boolean               = false
    var language: String                = "en"
    var gender: Option[String]          = None
    var birthDate: Option[Instant]      = None
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
        case "gender" =>
          gender = Option(reader.readString())
        case "birthDate" =>
          birthDate = Some(Instant.ofEpochMilli(reader.readDateTime()))
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

    MemberAccount(
      username = username,
      email = email,
      darkMode = darkMode,
      language = language,
      gender = gender,
      birthDate = birthDate,
      interests = interests
    )

  override def getEncoderClass: Class[MemberAccount] = classOf[MemberAccount]
