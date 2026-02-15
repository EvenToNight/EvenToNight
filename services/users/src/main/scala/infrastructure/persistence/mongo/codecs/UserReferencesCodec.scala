package infrastructure.persistence.mongo.codecs

import infrastructure.persistence.mongo.models.UserReferences
import org.bson.BsonReader
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext

class UserReferencesCodec extends Codec[UserReferences]:
  override def encode(writer: BsonWriter, value: UserReferences, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("_id", value.userId)
    writer.writeString("accountId", value.accountId)
    writer.writeString("profileId", value.profileId)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): UserReferences =
    reader.readStartDocument()
    val userId    = reader.readString("_id")
    val accountId = reader.readString("accountId")
    val profileId = reader.readString("profileId")
    reader.readEndDocument()
    UserReferences(userId, accountId, profileId)

  override def getEncoderClass: Class[UserReferences] = classOf[UserReferences]
