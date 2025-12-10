package domain.commands.validators

trait Validator[A]:
  def validate(value: A): Either[List[String], A]

object Validator:

  def validateCommand[A](cmd: A)(using v: Validator[A]): Either[List[String], A] =
    v.validate(cmd)

  def combine(validations: Either[String, ?]*): Either[List[String], Unit] =
    val errors = validations.collect { case Left(err) => err }
    if errors.isEmpty then Right(()) else Left(errors.toList)
