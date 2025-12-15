package domain.models

case class Location(
    name: Option[String],
    country: Option[String],
    country_code: Option[String],
    state: Option[String],
    province: Option[String],
    city: Option[String],
    road: Option[String],
    postcode: Option[String],
    house_number: Option[String],
    lat: Option[Double],
    lon: Option[Double],
    link: Option[String]
)

object Location:
  def create(
      name: Option[String] = None,
      country: Option[String] = None,
      country_code: Option[String] = None,
      state: Option[String] = None,
      province: Option[String] = None,
      city: Option[String] = None,
      road: Option[String] = None,
      postcode: Option[String] = None,
      house_number: Option[String] = None,
      lat: Option[Double] = None,
      lon: Option[Double] = None,
      link: Option[String] = None
  ): Location =
    Location(name, country, country_code, state, province, city, road, postcode, house_number, lat, lon, link)

  def Nil(): Location =
    Location(
      name = None,
      country = None,
      country_code = None,
      state = None,
      province = None,
      city = None,
      road = None,
      postcode = None,
      house_number = None,
      lat = None,
      lon = None,
      link = None
    )
