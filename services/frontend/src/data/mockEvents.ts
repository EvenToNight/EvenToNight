export interface Event {
  id: number
  imageUrl: string
  title: string
  subtitle: string
  date: Date
  favorite: boolean
  description: string
  location: string
  price: string
  organizer: string
}

export const mockEvents: Event[] = [
  {
    id: 1,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    title: 'Techno vibes',
    subtitle: 'Coccorico - Riccione',
    date: new Date(2024, 11, 8, 23, 0),
    favorite: false,
    description:
      'Join us for an unforgettable night of electronic music featuring top DJs from around the world. Experience the best techno vibes in one of the most iconic venues. The night will feature multiple stages with different music styles, from deep house to hard techno.',
    location: 'Coccorico, Via Chieti 44, Riccione RN, Italy',
    price: '€25',
    organizer: 'Coccorico Events',
  },
  {
    id: 2,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    title: 'House Music Night',
    subtitle: 'Fabric - London',
    date: new Date(2024, 11, 15, 22, 0),
    favorite: false,
    description:
      "Experience the finest house music in London's legendary Fabric nightclub. Featuring international DJs and the best sound system in the UK. Get ready for a night of deep grooves and unforgettable beats.",
    location: 'Fabric, 77A Charterhouse Street, London EC1M 6HJ, UK',
    price: '£20',
    organizer: 'Fabric London',
  },
  {
    id: 3,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    title: 'Electronic Dreams',
    subtitle: 'Berghain - Berlin',
    date: new Date(2024, 11, 22, 0, 0),
    favorite: true,
    description:
      "Step into the legendary Berghain for a night of pure electronic music. One of the world's most famous techno clubs brings you an exceptional lineup of underground artists. Experience techno at its finest.",
    location: 'Berghain, Am Wriezener Bahnhof, Berlin, Germany',
    price: '€18',
    organizer: 'Berghain Events',
  },
  {
    id: 4,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    title: 'Summer Festival 2024',
    subtitle: 'Open Air Stage',
    date: new Date(2025, 5, 8, 18, 0),
    favorite: false,
    description:
      'The biggest summer festival of the year featuring over 50 artists across 5 stages. From sunset to sunrise, enjoy electronic music in a beautiful outdoor setting with camping options available.',
    location: 'Festival Grounds, Countryside Park',
    price: '€85',
    organizer: 'Summer Sounds Productions',
  },
  {
    id: 5,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    title: 'Deep House Sessions',
    subtitle: 'Watergate - Berlin',
    date: new Date(2024, 11, 28, 23, 30),
    favorite: false,
    description:
      "Immerse yourself in the smooth sounds of deep house at Berlin's Watergate. Located by the river with stunning views, this venue offers an intimate setting for true house music lovers.",
    location: 'Watergate, Falckensteinstraße 49, Berlin, Germany',
    price: '€15',
    organizer: 'Watergate Club',
  },
  {
    id: 6,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    title: 'Minimal Techno Night',
    subtitle: 'Amnesia - Ibiza',
    date: new Date(2025, 6, 5, 0, 0),
    favorite: true,
    description:
      "Celebrate the summer at Amnesia Ibiza with a special minimal techno night. World-renowned DJs will take you on a journey through hypnotic beats and driving basslines in one of Ibiza's most iconic clubs.",
    location: 'Amnesia, Carretera Ibiza a San Antonio, Ibiza, Spain',
    price: '€50',
    organizer: 'Amnesia Ibiza',
  },
]

export const getEventById = (id: number | string): Event | undefined => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id
  return mockEvents.find((event) => event.id === numericId)
}
