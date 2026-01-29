import { EventSeedInput } from "../schemas/event.schema";

export const eventsSeedData: EventSeedInput[] = [
  // ---------- DRAFT ----------
{
    creator: "Cocoricò",
    title: "Begin of Summer 2026",
    description: "Opening party to celebrate the beginning of summer 2026.",
    tags: ["DJ Set", "Over 18"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "DRAFT",
    date: new Date("2026-05-30T21:00:00").toISOString().slice(0, -1),
    poster: "begin-summer-2026.jpg"
  },

  {
    creator: "Di and Gi Srl",
    title: "MIKA Live 2026",
    description: "MIKA live concert tour 2026.",
    tags: ["Concert", "Live Music", "Pop"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "PUBLISHED",
    date: new Date("2026-03-02T20:30:00").toISOString().slice(0, -1),
    poster: "mika-tour.jpg"
  },

  {
    creator: "sunset",
    title: "Golden Hour White Party",
    description: "Sunset beach party dressed in white.",
    tags: ["Outdoor", "Party", "White Party"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "PUBLISHED",
    date: new Date("2026-06-20T18:00:00").toISOString().slice(0, -1),
    poster: "white-party.jpg"
  },

  {
    creator: "cornerbar",
    title: "Halloween Party",
    description: "Spooky drinks, DJ set and costume contest.",
    tags: ["Bar", "Halloween", "DJ Set"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "CANCELLED",
    date: new Date("2026-10-31T21:00:00").toISOString().slice(0, -1),
    poster: "cornerbar-halloween.png"
  },

  {
    creator: "sunset",
    title: "Sunset on the Beach",
    description: "Relaxing sunset party on the beach.",
    tags: ["Outdoor"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "COMPLETED",
    date: new Date("2025-06-15T19:00:00").toISOString().slice(0, -1),
    poster: "sunset-on-the-beach.jpg"
  },

  {
    creator: "stagevibes",
    title: "Indie Night Live",
    description: "Live indie bands from all over Europe.",
    tags: ["Live Music", "Show"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "PUBLISHED",
    date: new Date("2026-04-18T21:00:00").toISOString().slice(0, -1),
    poster: "indie-night.jpg"
  },

  {
    creator: "openair_fest",
    title: "Open Air Festival 2026",
    description: "Three days of music, food and outdoor fun.",
    tags: ["Outdoor", "Live Music"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "PUBLISHED",
    date: new Date("2026-07-10T16:00:00").toISOString().slice(0, -1),
    poster: "openair-festival.jpg"
  },

  {
    creator: "sing&fun",
    title: "Karaoke Friday Night",
    description: "Sing your favorite songs all night long.",
    tags: ["Karaoke", "Party"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "PUBLISHED",
    date: new Date("2026-02-13T21:30:00").toISOString().slice(0, -1),
    poster: "karaoke-night.jpg"
  },

  {
    creator: "taste_nightlife",
    title: "Dinner & Jazz Experience",
    description: "Elegant dinner followed by live jazz music.",
    tags: ["Dinner", "Live Music"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "PUBLISHED",
    date: new Date("2026-11-22T20:00:00").toISOString().slice(0, -1),
    poster: "dinner-jazz.jpg"
  },

  {
    creator: "exclusive_nights",
    title: "Luxury Private Night",
    description: "Invitation-only luxury night event.",
    tags: ["Private Event"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "PUBLISHED",
    date: new Date("2026-09-18T21:00:00").toISOString().slice(0, -1),
    poster: "luxury-night.jpg"
  },

  {
    creator: "sunset",
    title: "Sunset Cesena 06/06",
    description: "Relaxing sunset party in Cesena.",
    tags: ["Outdoor", "Party"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "PUBLISHED",
    date: new Date("2026-06-06T18:00:00").toISOString().slice(0, -1),
    poster: "sunset-cesena.jpg"
  },

  {
    creator: "sunset",
    title: "Sunset Cesena",
    description: "Relaxing sunset party in Cesena.",
    tags: ["Outdoor", "Party"],
    location: {
      name: "Central Park",
      country: "United States",
      country_code: "US",
      state: "New York",
      province: "NY",
      city: "New York",
      road: "5th Ave",
      postcode: "10022",
      house_number: "1",
      lat: 40.785091,
      lon: -73.968285,
      link: "https://www.google.com/maps/search/?api=1&query=central+park"
    },
    status: "DRAFT",
    date: new Date("2026-07-04T18:00:00").toISOString().slice(0, -1),
    poster: "sunset-cesena2.jpg"
  },

];
