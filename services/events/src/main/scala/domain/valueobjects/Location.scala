package domain.valueobjects

case class Location private (
    name: Option[String],
    country: Option[String],
    countryCode: Option[String],
    state: Option[String],
    province: Option[String],
    city: Option[String],
    road: Option[String],
    postcode: Option[String],
    houseNumber: Option[String],
    coordinates: Option[Coordinates],
    link: Option[String]
):

  def displayName: String =
    name.orElse(city).getOrElse("Unknown Location")

  def hasCoordinates: Boolean = coordinates.isDefined

  def latLon: Option[(Double, Double)] =
    coordinates.map(c => (c.latitude, c.longitude))

object Location:

  def apply(
      name: Option[String] = None,
      country: Option[String] = None,
      countryCode: Option[String] = None,
      state: Option[String] = None,
      province: Option[String] = None,
      city: Option[String] = None,
      road: Option[String] = None,
      postcode: Option[String] = None,
      houseNumber: Option[String] = None,
      lat: Option[Double] = None,
      lon: Option[Double] = None,
      link: Option[String] = None
  ): Either[String, Location] =

    if name.isEmpty && city.isEmpty then
      Left("Location must have at least a name or a city")
    else
      val coords = (lat, lon) match
        case (Some(latitude), Some(longitude)) =>
          Coordinates(latitude, longitude).toOption
        case _ => None

      Right(new Location(
        name = name.map(_.trim).filter(_.nonEmpty),
        country = country.map(_.trim).filter(_.nonEmpty),
        countryCode = countryCode.map(_.trim.toUpperCase).filter(_.nonEmpty),
        state = state.map(_.trim).filter(_.nonEmpty),
        province = province.map(_.trim).filter(_.nonEmpty),
        city = city.map(_.trim).filter(_.nonEmpty),
        road = road.map(_.trim).filter(_.nonEmpty),
        postcode = postcode.map(_.trim).filter(_.nonEmpty),
        houseNumber = houseNumber.map(_.trim).filter(_.nonEmpty),
        coordinates = coords,
        link = link.map(_.trim).filter(_.nonEmpty)
      ))

  def unsafe(
      name: Option[String] = None,
      country: Option[String] = None,
      countryCode: Option[String] = None,
      state: Option[String] = None,
      province: Option[String] = None,
      city: Option[String] = None,
      road: Option[String] = None,
      postcode: Option[String] = None,
      houseNumber: Option[String] = None,
      lat: Option[Double] = None,
      lon: Option[Double] = None,
      link: Option[String] = None
  ): Location =
    val coords = (lat, lon) match
      case (Some(latitude), Some(longitude)) =>
        Some(Coordinates.unsafe(latitude, longitude))
      case _ => None

    new Location(name, country, countryCode, state, province, city, road, postcode, houseNumber, coords, link)

case class Coordinates private (latitude: Double, longitude: Double)

object Coordinates:

  private val MinLatitude  = -90.0
  private val MaxLatitude  = 90.0
  private val MinLongitude = -180.0
  private val MaxLongitude = 180.0

  def apply(latitude: Double, longitude: Double): Either[String, Coordinates] =
    if latitude < MinLatitude || latitude > MaxLatitude then
      Left(s"Latitude must be between $MinLatitude and $MaxLatitude")
    else if longitude < MinLongitude || longitude > MaxLongitude then
      Left(s"Longitude must be between $MinLongitude and $MaxLongitude")
    else
      Right(new Coordinates(latitude, longitude))

  def unsafe(latitude: Double, longitude: Double): Coordinates =
    new Coordinates(latitude, longitude)
