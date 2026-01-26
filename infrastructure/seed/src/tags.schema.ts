import { z } from "zod";

export const TagsSchema = z.enum([
  // EventType
  "Live Music",
  "Concert",
  "DJ Set",
  "Party",
  "Dinner",
  "Karaoke",
  "Show",

  // Venue
  "Club",
  "Pub",
  "Bar",
  "Restaurant",
  "Theatre",
  "Outdoor",

  // MusicStyle
  "Electronic",
  "Pop",
  "Hip Hop",
  "Rock",
  "Reggaeton",
  "Commercial",

  // Special
  "Halloween",
  "Christmas",
  "New Year",
  "Carnival",
  "Private Event",

  // Target
  "Students",
  "Over 18",
  "Over 30",
  "Family Friendly",

  // Extra
  "Dress Code",
  "White Party",
  "Black Party",
  "Free Entry",
  "Reservations Required"
]);

export type Tag = z.infer<typeof TagsSchema>;
