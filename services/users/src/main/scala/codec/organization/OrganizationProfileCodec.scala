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
    writer.writeString("name", value.name)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationProfile =
    reader.readStartDocument()
    if (reader.readBsonType() == BsonType.OBJECT_ID) then reader.readObjectId()
    val name = reader.readString("name")
    reader.readEndDocument()
    OrganizationProfile(name)

  override def getEncoderClass: Class[OrganizationProfile] = classOf[OrganizationProfile]
