package codec

import model.ForeignKeys
import org.bson.BsonReader
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class ForeignKeysCodec extends Codec[ForeignKeys]:
  override def encode(writer: BsonWriter, value: ForeignKeys, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("_id", value.userId)
    writer.writeString("accountId", value.accountId)
    writer.writeString("profileId", value.profileId)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): ForeignKeys =
    reader.readStartDocument()
    val userId    = reader.readString("_id")
    val accountId = reader.readString("accountId")
    val profileId = reader.readString("profileId")
    reader.readEndDocument()
    ForeignKeys(userId, accountId, profileId)

  override def getEncoderClass: Class[ForeignKeys] = classOf[ForeignKeys]
