package infrastructure.adapters

import com.mongodb.client.MongoClient
import domain.repositories.{TransactionContext, UnitOfWork}

import scala.util.Try

/** Implementation of UnitOfWork using MongoDB transactions
  * Provides transactional semantics for domain operations
  */
class MongoUnitOfWork(mongoClient: MongoClient) extends UnitOfWork:

  override def execute[T](operation: TransactionContext => Either[String, T]): Either[String, T] =
    println("[Transaction] Creating session")
    val session = mongoClient.startSession()

    try
      println(s"[Transaction] Starting transaction - session id: ${session.getServerSession.getIdentifier}")
      session.startTransaction()

      // Wrap MongoDB session in our domain TransactionContext
      val ctx = new MongoTransactionContext(session)

      println("[Transaction] Executing operation")
      operation(ctx) match
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

/** MongoDB-specific implementation of TransactionContext
  * Wraps MongoDB ClientSession to hide infrastructure details from domain
  */
class MongoTransactionContext(val session: com.mongodb.client.ClientSession) extends TransactionContext
