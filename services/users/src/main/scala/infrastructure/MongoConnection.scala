package infrastructure

import codec.ForeignKeysCodec
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
      new ForeignKeysCodec
    )
  )
  private val settings = MongoClientSettings.builder().codecRegistry(pojoCodecRegistry).applyConnectionString(
    new com.mongodb.ConnectionString("mongodb://localhost:27017")
  ).build()
  val client: MongoClient = MongoClients.create(settings)

  def membersDB: MongoDatabase       = client.getDatabase("members_db")
  def organizationsDB: MongoDatabase = client.getDatabase("organizations_db")
