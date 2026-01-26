import { EventSeedInput } from "../schemas/event.schema";

export const eventsSeedData: EventSeedInput[] = [
  // ---------- DRAFT ----------
  {
    creator: "Cocoricò",
    title: "Begin of Summer 2026",
    description: "The first summer party of 2026",
    status: "DRAFT",
    date: new Date("2026-05-30T09:00:00").toISOString()
  },
  // ---------- PUBLISHED ----------
  {
    creator: "Di and Gi Srl",
    title: "MIKA",
    description: "MIKA live 2026",
    poster: "mika-tour.jpg",
    status: "PUBLISHED",
    date: new Date("2026-03-02T10:00:00").toISOString(),
    price: 50
  },
  {
    creator: "sunset_vibes",
    title: "Goldeh Hour White Party",
    poster: "white-party.jpg",
    tags: ["Outdoor", "Party", "White Party"],
    status: "PUBLISHED",
    date: new Date("2026-06-20T17:00:00").toISOString(),
    price: 30,
    collaborators: ["drink&more"]
  },
  // ---------- CANCELLED ----------
  {
    creator: "cornerbar",
    title: "Halloween Party",
    description: "Halloween night with spooky drinks and costume contest",
    poster: "cornerbar-halloween.png",
    tags: ["Bar", "Party", "Halloween", "DJ Set"],
    status: "CANCELLED",
    date: new Date("2026-10-31T20:00:00").toISOString()
  },
  // ---------- COMPLETED ----------
  {
    creator: "sunset_vibes",
    title: "Sunset on the beach",
    description: "Sunset on the beach completed successfully",
    poster: "sunset-on-the-beach.jpg",
    tags: ["Outdoor"],
    status: "COMPLETED",
    date: new Date("2025-06-15T12:00:00").toISOString(),
    price: 25
  }
];
