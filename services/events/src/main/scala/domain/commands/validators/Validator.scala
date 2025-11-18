package domain.commands.validators

trait Validator[A]:
  def validate(value: A): Either[List[String], A]

object Validator:
  def validateCommand[A](cmd: A)(using v: Validator[A]) =
    v.validate(cmd)
