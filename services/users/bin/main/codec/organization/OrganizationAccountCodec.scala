package codec.organization

import model.organization.OrganizationAccount
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class OrganizationAccountCodec extends Codec[OrganizationAccount]:
  override def encode(writer: BsonWriter, value: OrganizationAccount, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("keycloakId", value.keycloakId)
    writer.writeString("email", value.email)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationAccount =
    reader.readStartDocument()
    if (reader.readBsonType() == BsonType.OBJECT_ID) then reader.readObjectId()
    val keycloakId = reader.readString("keycloakId")
    val email      = reader.readString("email")
    reader.readEndDocument()
    OrganizationAccount(keycloakId, email)

  override def getEncoderClass: Class[OrganizationAccount] = classOf[OrganizationAccount]
