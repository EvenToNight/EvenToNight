package application.registration

case class ValidRegistration(
    username: String,
    email: String,
    password: String,
    role: String
)
