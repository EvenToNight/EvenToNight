import type { Location, LocationData } from './types/common'

export const extractLocationMapsLink = (location: LocationData): string => {
  const query = `${location.name ? `${location.name},` : ''}${location.house_number ? `${location.house_number},` : ''}${location.road},${location.city},${location.province},${location.state},${location.postcode},${location.country}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export const buildLocationDisplayName = (location: LocationData): string => {
  const parts = []
  if (location.name) parts.push(location.name)
  if (location.house_number) parts.push(location.house_number)
  if (location.road) parts.push(location.road)
  if (location.city) parts.push(location.city)
  if (location.province) parts.push(location.province)
  if (location.state) parts.push(location.state)
  if (location.postcode) parts.push(location.postcode)
  if (location.country) parts.push(location.country)
  return parts.join(', ')
}

const validateLocation = (location: any): any => {
  if (!location.address) throw new Error('Location address data is missing')
  const address = location.address

  if (!address.country) throw new Error('Country is required')
  if (!address.country_code) throw new Error('Country code is required')
  if (!address.state) throw new Error('State is required')
  if (!address.province && !address.county) throw new Error('Province or county is required')
  if (!address.city && !address.town && !address.village)
    throw new Error('City, town, or village is required')
  if (!address.road) throw new Error('Road is required')
  if (!address.postcode) throw new Error('Postcode is required')
  if (!location.lat) throw new Error('Latitude is required')
  if (!location.lon) throw new Error('Longitude is required')
  if (!location.display_name) throw new Error('Display name is required')
  return location
}
export const parseLocation = (locationResponseData: any): [string, Location] => {
  locationResponseData = validateLocation(locationResponseData)
  const address = locationResponseData.address

  const locationData: LocationData = {
    name: locationResponseData.name || '',
    country: address.country,
    country_code: address.country_code,
    state: address.state,
    province: address.province || address.county,
    city: address.city || address.town || address.village,
    road: address.road,
    postcode: address.postcode,
    house_number: address.house_number,
    lat: parseFloat(locationResponseData.lat),
    lon: parseFloat(locationResponseData.lon),
  }
  const location: Location = { ...locationData, link: extractLocationMapsLink(locationData) }
  return [locationResponseData.display_name, location]
}
