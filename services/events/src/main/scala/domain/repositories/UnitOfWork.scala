package domain.repositories

/** Unit of Work pattern for managing transactions
  * This is a Domain layer abstraction - the implementation details (MongoDB Session, etc.)
  * are handled by the Infrastructure layer
  *
  * Ensures atomicity: all operations within execute() succeed or all fail together
  */
trait UnitOfWork:

  /** Executes a transaction with automatic commit/rollback
    * @param operation the transactional operation to execute
    * @return Right with result if successful, Left with error if failed (triggers rollback)
    */
  def execute[T](operation: TransactionContext => Either[String, T]): Either[String, T]

/** Marker trait representing a transactional context
  * Passed to repositories during transactional operations
  * The infrastructure implementation will contain the actual session/connection
  */
trait TransactionContext
