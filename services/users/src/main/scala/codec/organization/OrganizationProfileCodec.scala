package codec.organization

import infrastructure.Wiring.mediaBaseUrl
import model.organization.OrganizationProfile
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

import scala.collection.mutable.ListBuffer

class OrganizationProfileCodec extends Codec[OrganizationProfile]:
  override def encode(writer: BsonWriter, value: OrganizationProfile, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("name", value.name)
    writer.writeString("avatar", value.avatar)
    value.bio.foreach(b =>
      writer.writeString("bio", b)
    )
    value.contacts.foreach(list =>
      writer.writeStartArray("contacts")
      list.foreach(writer.writeString)
      writer.writeEndArray()
    )
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationProfile =
    var name: String                   = null
    var avatar: String                 = s"http://${mediaBaseUrl}/users/default.png"
    var bio: Option[String]            = None
    var contacts: Option[List[String]] = None

    reader.readStartDocument()
    while (reader.readBsonType() != BsonType.END_OF_DOCUMENT) {
      reader.readName() match
        case "_id" =>
          reader.skipValue()
        case "name" =>
          name = reader.readString()
        case "avatar" =>
          avatar = reader.readString()
        case "bio" =>
          bio = Some(reader.readString())
        case "contacts" =>
          val buffer = ListBuffer.empty[String]
          reader.readStartArray()
          while (reader.readBsonType() != BsonType.END_OF_DOCUMENT) {
            buffer += reader.readString()
          }
          reader.readEndArray()
          contacts = Some(buffer.toList)
        case _ =>
          reader.skipValue()
    }
    reader.readEndDocument()

    OrganizationProfile(
      name = name,
      avatar = avatar,
      bio = bio,
      contacts = contacts
    )

  override def getEncoderClass: Class[OrganizationProfile] = classOf[OrganizationProfile]
