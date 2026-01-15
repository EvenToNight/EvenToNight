package infrastructure.mongo

import codec.UserReferencesCodec
import codec.member.MemberAccountCodec
import codec.member.MemberProfileCodec
import codec.organization.OrganizationAccountCodec
import codec.organization.OrganizationProfileCodec
import com.mongodb.MongoClientSettings
import com.mongodb.client.MongoClient
import com.mongodb.client.MongoClients
import com.mongodb.client.MongoDatabase
import org.bson.codecs.configuration.CodecRegistries.fromCodecs
import org.bson.codecs.configuration.CodecRegistries.fromRegistries

object MongoConnection:
  private val pojoCodecRegistry = fromRegistries(
    MongoClientSettings.getDefaultCodecRegistry(),
    fromCodecs(
      new MemberAccountCodec,
      new MemberProfileCodec,
      new OrganizationAccountCodec,
      new OrganizationProfileCodec,
      new UserReferencesCodec
    )
  )

  val mongoHost: String = sys.env.getOrElse("MONGO_HOST", "localhost")
  val mongoPort: String = "27017"
  val mongoUri: String  = s"mongodb://$mongoHost:$mongoPort"

  private val settings = MongoClientSettings.builder().codecRegistry(pojoCodecRegistry).applyConnectionString(
    new com.mongodb.ConnectionString(mongoUri)
  ).build()
  val client: MongoClient = MongoClients.create(settings)

  def membersDB: MongoDatabase       = client.getDatabase("members_db")
  def organizationsDB: MongoDatabase = client.getDatabase("organizations_db")
