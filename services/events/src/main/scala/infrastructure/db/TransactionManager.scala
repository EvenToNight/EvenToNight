package infrastructure.db

import com.mongodb.client.{ClientSession, MongoClient}

import scala.util.Try

class TransactionManager(mongoClient: MongoClient):

  def executeInTransaction[T](operation: ClientSession => Either[String, T]): Either[String, T] =
    println("[Transaction] Creating session")
    val session = mongoClient.startSession()

    try
      println(s"[Transaction] Starting transaction - session id: ${session.getServerSession.getIdentifier}")
      session.startTransaction()

      println("[Transaction] Executing operation")
      operation(session) match
        case Right(result) =>
          println("[Transaction] Committing transaction")
          session.commitTransaction()
          println("[Transaction] Transaction committed successfully")
          Right(result)
        case Left(error) =>
          println(s"[Transaction] Error during transaction: $error")
          println("[Transaction] Aborting transaction")
          session.abortTransaction()
          println("[Transaction] Transaction aborted")
          Left(error)
    catch
      case ex: Exception =>
        println(s"[Transaction] Exception during transaction: ${ex.getMessage}")
        println("[Transaction] Aborting transaction")
        Try(session.abortTransaction())
        Left(s"Transaction failed: ${ex.getMessage}")
    finally
      println("[Transaction] Ending session")
      session.close()
      println("[Transaction] Session ended")
