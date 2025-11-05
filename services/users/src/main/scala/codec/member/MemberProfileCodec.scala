package codec.member

import model.member.MemberProfile
import org.bson.BsonReader
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class MemberProfileCodec extends Codec[MemberProfile]:
  override def encode(writer: BsonWriter, value: MemberProfile, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("_id", value.accountId)
    writer.writeString("nickname", value.nickname)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): MemberProfile =
    reader.readStartDocument()
    val accountId = reader.readString("_id")
    val nickname  = reader.readString("nickname")
    reader.readEndDocument()
    MemberProfile(accountId, nickname)

  override def getEncoderClass: Class[MemberProfile] = classOf[MemberProfile]
