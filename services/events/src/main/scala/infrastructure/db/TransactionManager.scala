package infrastructure.db

import com.mongodb.client.{ClientSession, MongoClient}

import scala.util.Try

class TransactionManager(mongoClient: MongoClient):

  def executeInTransaction[T](operation: ClientSession => Either[String, T]): Either[String, T] =
    val session = mongoClient.startSession()

    try
      session.startTransaction()
      operation(session) match
        case Right(result) =>
          session.commitTransaction()
          Right(result)
        case Left(error) =>
          session.abortTransaction()
          Left(error)
    catch
      case ex: Exception =>
        Try(session.abortTransaction())
        Left(s"Transaction failed: ${ex.getMessage}")
    finally
      session.close()
