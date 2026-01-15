package codec.member

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
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): MemberProfile =
    reader.readStartDocument()
    if (reader.readBsonType() == BsonType.OBJECT_ID) then reader.readObjectId()
    val name = reader.readString("name")
    reader.readEndDocument()
    MemberProfile(name)

  override def getEncoderClass: Class[MemberProfile] = classOf[MemberProfile]
