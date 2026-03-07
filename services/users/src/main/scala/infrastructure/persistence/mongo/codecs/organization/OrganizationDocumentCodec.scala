package infrastructure.persistence.mongo.codecs.organization

import domain.valueobjects.organization.OrganizationAccount
import domain.valueobjects.organization.OrganizationProfile
import infrastructure.persistence.mongo.models.organization.OrganizationDocument
import org.bson.BsonReader
import org.bson.BsonType
import org.bson.BsonWriter
import org.bson.codecs.Codec
import org.bson.codecs.DecoderContext
import org.bson.codecs.EncoderContext
import org.bson.codecs.configuration.CodecRegistry

class OrganizationDocumentCodec(registry: CodecRegistry) extends Codec[OrganizationDocument]:
  private val accountCodec = registry.get(classOf[OrganizationAccount])
  private val profileCodec = registry.get(classOf[OrganizationProfile])

  override def encode(writer: BsonWriter, value: OrganizationDocument, encoderContext: EncoderContext): Unit =
    writer.writeStartDocument()
    writer.writeString("_id", value.userId)
    writer.writeName("account")
    accountCodec.encode(writer, value.account, encoderContext)
    writer.writeName("profile")
    profileCodec.encode(writer, value.profile, encoderContext)
    writer.writeEndDocument()

  override def decode(reader: BsonReader, decoderContext: DecoderContext): OrganizationDocument =
    reader.readStartDocument()
    var userId: String               = null
    var account: OrganizationAccount = null
    var profile: OrganizationProfile = null

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
    OrganizationDocument(userId, account, profile)

  override def getEncoderClass: Class[OrganizationDocument] = classOf[OrganizationDocument]
