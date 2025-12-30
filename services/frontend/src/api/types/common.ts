export interface LocationData {
  name?: string
  country: string
  country_code: string
  state: string
  province: string
  city: string
  road: string
  postcode: string
  house_number?: string
  lat: number
  lon: number
}

export interface Location extends LocationData {
  link: string
}
