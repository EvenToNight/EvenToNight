package codec.organization

import model.organization.OrganizationAccount
import org.bson.BsonReader
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class OrganizationAccountCodec extends Codec[OrganizationAccount]:
  override def encode(writer: BsonWriter, value: OrganizationAccount, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("_id", value.id)
    writer.writeString("email", value.email)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationAccount =
    reader.readStartDocument()
    val id    = reader.readString("_id")
    val email = reader.readString("email")
    reader.readEndDocument()
    OrganizationAccount(id, email)

  override def getEncoderClass: Class[OrganizationAccount] = classOf[OrganizationAccount]
