export interface Location {
  name?: string
  country: string
  countryCode: string
  state: string
  province: string
  city: string
  road: string
  postcode: number
  house_number: number
  lat: number
  lon: number
  link: string
}

export const extractLocationMapsLink = (location: Location): string => {
  const query = `${location.name ? `${location.name},` : ''}${location.house_number},${location.road},${location.city},${location.province},${location.state},${location.postcode},${location.country}`
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
