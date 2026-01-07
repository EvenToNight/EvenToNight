package codec.member

import model.member.MemberAccount
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class MemberAccountCodec extends Codec[MemberAccount]:
  override def encode(writer: BsonWriter, value: MemberAccount, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("keycloakId", value.keycloakId)
    writer.writeString("username", value.username)
    writer.writeString("email", value.email)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): MemberAccount =
    reader.readStartDocument()
    if (reader.readBsonType() == BsonType.OBJECT_ID) then reader.readObjectId()
    val keycloakId = reader.readString("keycloakId")
    val username   = reader.readString("username")
    val email      = reader.readString("email")
    reader.readEndDocument()
    MemberAccount(keycloakId, username, email)

  override def getEncoderClass: Class[MemberAccount] = classOf[MemberAccount]
