package codec.organization

import model.organization.OrganizationProfile
import org.bson.BsonReader
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class OrganizationProfileCodec extends Codec[OrganizationProfile]:
  override def encode(writer: BsonWriter, value: OrganizationProfile, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("_id", value.accountId)
    writer.writeString("nickname", value.nickname)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationProfile =
    reader.readStartDocument()
    val accountId = reader.readString("_id")
    val nickname  = reader.readString("nickname")
    reader.readEndDocument()
    OrganizationProfile(accountId, nickname)

  override def getEncoderClass: Class[OrganizationProfile] = classOf[OrganizationProfile]
