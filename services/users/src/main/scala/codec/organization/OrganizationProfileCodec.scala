package codec.organization

import model.organization.OrganizationProfile
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class OrganizationProfileCodec extends Codec[OrganizationProfile]:
  override def encode(writer: BsonWriter, value: OrganizationProfile, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("nickname", value.nickname)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationProfile =
    reader.readStartDocument()
    if (reader.readBsonType() == BsonType.OBJECT_ID) then reader.readObjectId()
    val nickname = reader.readString("nickname")
    reader.readEndDocument()
    OrganizationProfile(nickname)

  override def getEncoderClass: Class[OrganizationProfile] = classOf[OrganizationProfile]
