package infrastructure.persistence.mongo.codecs.member

import domain.valueobjects.member.MemberAccount
import domain.valueobjects.member.MemberProfile
import infrastructure.persistence.mongo.models.member.MemberDocument
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext
import org.bson.codecs.configuration.CodecRegistry

class MemberDocumentCodec(registry: CodecRegistry) extends Codec[MemberDocument]:
  private val accountCodec = registry.get(classOf[MemberAccount])
  private val profileCodec = registry.get(classOf[MemberProfile])

  override def encode(writer: BsonWriter, value: MemberDocument, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("_id", value.userId)
    writer.writeName("account")
    accountCodec.encode(writer, value.account, encoderContext)
    writer.writeName("profile")
    profileCodec.encode(writer, value.profile, encoderContext)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): MemberDocument =
    reader.readStartDocument()
    var userId: String         = null
    var account: MemberAccount = null
    var profile: MemberProfile = null

    while (reader.readBsonType() != BsonType.END_OF_DOCUMENT) {
      reader.readName() match
        case "_id" =>
          userId = reader.readString()
        case "account" =>
          account = accountCodec.decode(reader, decoderContext)
        case "profile" =>
          profile = profileCodec.decode(reader, decoderContext)
        case _ =>
          reader.skipValue()
    }

    reader.readEndDocument()
    MemberDocument(userId, account, profile)

  override def getEncoderClass: Class[MemberDocument] = classOf[MemberDocument]
