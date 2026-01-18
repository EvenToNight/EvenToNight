package codec.member

import infrastructure.Wiring.mediaBaseUrl
import model.member.MemberProfile
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class MemberProfileCodec extends Codec[MemberProfile]:
  override def encode(writer: BsonWriter, value: MemberProfile, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("name", value.name)
    writer.writeString("avatar", value.avatar)
    value.bio.foreach(b =>
      writer.writeString("bio", b)
    )
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): MemberProfile =
    var name: String        = null
    var avatar: String      = s"http://${mediaBaseUrl}/users/default.png"
    var bio: Option[String] = None

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
        case _ =>
          reader.skipValue()
    }
    reader.readEndDocument()

    MemberProfile(
      name = name,
      avatar = avatar,
      bio = bio
    )

  override def getEncoderClass: Class[MemberProfile] = classOf[MemberProfile]
