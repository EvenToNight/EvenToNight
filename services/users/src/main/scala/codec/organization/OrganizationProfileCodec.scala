package codec.organization

import domain.valueobjects.organization.OrganizationProfile
import domain.valueobjects.organization.UrlString
import domain.valueobjects.organization.UrlString.validateUrl
import infrastructure.Wiring.mediaBaseUrl
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
    value.contacts.foreach(urls =>
      writer.writeStartArray("contacts")
      urls.foreach(u => writer.writeString(u.value))
      writer.writeEndArray()
    )
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationProfile =
    def readContacts(): Option[List[UrlString]] =
      if reader.getCurrentBsonType == BsonType.NULL then
        reader.skipValue()
        None
      else
        val buffer = ListBuffer.empty[UrlString]
        reader.readStartArray()
        while reader.readBsonType() != BsonType.END_OF_DOCUMENT do
          validateUrl(reader.readString()).foreach(buffer += _)
        reader.readEndArray()
        Some(buffer.toList).filter(_.nonEmpty)

    var name: String                      = null
    var avatar: String                    = s"http://${mediaBaseUrl}/users/default.png"
    var bio: Option[String]               = None
    var contacts: Option[List[UrlString]] = None

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
          contacts = readContacts()
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
