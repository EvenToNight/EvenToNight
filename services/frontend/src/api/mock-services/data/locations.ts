import type { Location } from '@/api/types/common'
import { extractLocationMapsLink } from '@/api/types/common'

const event1Location: Location = {
  name: 'Cocoricò',
  country: 'Italia',
  countryCode: 'it',
  state: 'Emilia-Romagna',
  province: 'Rimini',
  city: 'Riccione',
  road: 'Via Chieti',
  postcode: 47838,
  house_number: 44,
  lat: 43.9873461,
  lon: 12.6567808,
  link: '',
}
event1Location.link = extractLocationMapsLink(event1Location)

const event2Location: Location = event1Location
const event3Location: Location = event1Location
const event4Location: Location = event1Location
const event5Location: Location = event1Location
const event6Location: Location = event1Location
const event7Location: Location = event1Location
const event8Location: Location = event1Location

export {
  event1Location,
  event2Location,
  event3Location,
  event4Location,
  event5Location,
  event6Location,
  event7Location,
  event8Location,
}
