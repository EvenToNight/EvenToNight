package codec

import model.ForeignKeys
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class ForeignKeysCodec extends Codec[ForeignKeys]:
  override def encode(writer: BsonWriter, value: ForeignKeys, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("accountId", value.accountId)
    writer.writeString("profileId", value.profileId)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): ForeignKeys =
    reader.readStartDocument()
    if (reader.readBsonType() == BsonType.OBJECT_ID) then reader.readObjectId()
    val accountId = reader.readString("accountId")
    val profileId = reader.readString("profileId")
    reader.readEndDocument()
    ForeignKeys(accountId, profileId)

  override def getEncoderClass: Class[ForeignKeys] = classOf[ForeignKeys]
