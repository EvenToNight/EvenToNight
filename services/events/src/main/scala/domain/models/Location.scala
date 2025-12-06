package domain.models

case class Location(
    name: String,
    country: String,
    country_code: String,
    state: String,
    province: String,
    city: String,
    road: String,
    postcode: String,
    house_number: String,
    lat: Double,
    lon: Double,
    link: String
)

object Location:
  def create(
      name: String = "",
      country: String,
      country_code: String,
      state: String = "",
      province: String = "",
      city: String = "",
      road: String,
      postcode: String,
      house_number: String = "",
      lat: Double,
      lon: Double,
      link: String
  ): Location =
    Location(name, country, country_code, state, province, city, road, postcode, house_number, lat, lon, link)

  def Nil(): Location =
    Location(
      name = "",
      country = "",
      country_code = "",
      state = "",
      province = "",
      city = "",
      road = "",
      postcode = "",
      house_number = "",
      lat = 0.0,
      lon = 0.0,
      link = ""
    )
