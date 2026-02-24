package infrastructure.persistence.mongo

import com.mongodb.MongoClientSettings
import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import com.mongodb.client.MongoDatabase
import infrastructure.persistence.mongo.codecs.member.MemberAccountCodec
import infrastructure.persistence.mongo.codecs.member.MemberDocumentCodec
import infrastructure.persistence.mongo.codecs.member.MemberProfileCodec
import infrastructure.persistence.mongo.codecs.organization.OrganizationAccountCodec
import infrastructure.persistence.mongo.codecs.organization.OrganizationDocumentCodec
import infrastructure.persistence.mongo.codecs.organization.OrganizationProfileCodec
import org.bson.codecs.configuration.CodecRegistries.fromCodecs
import org.bson.codecs.configuration.CodecRegistries.fromRegistries

object MongoConnection:
  private val baseRegistry = fromRegistries(
    MongoClientSettings.getDefaultCodecRegistry(),
    fromCodecs(
      new MemberAccountCodec,
      new MemberProfileCodec,
      new OrganizationAccountCodec,
      new OrganizationProfileCodec
    )
  )
  private val memberDocumentCodec       = new MemberDocumentCodec(baseRegistry)
  private val organizationDocumentCodec = new OrganizationDocumentCodec(baseRegistry)
  private val pojoCodecRegistry =
    fromRegistries(baseRegistry, fromCodecs(memberDocumentCodec, organizationDocumentCodec))

  val mongoHost: String = sys.env.getOrElse("MONGO_HOST", "localhost")
  val mongoPort: String = "27017"
  val mongoUri: String  = s"mongodb://$mongoHost:$mongoPort"

  private val settings = MongoClientSettings.builder().codecRegistry(pojoCodecRegistry).applyConnectionString(
    new com.mongodb.ConnectionString(mongoUri)
  ).build()
  val client: MongoClient = MongoClients.create(settings)

  def usersDB: MongoDatabase = client.getDatabase("users_db")
