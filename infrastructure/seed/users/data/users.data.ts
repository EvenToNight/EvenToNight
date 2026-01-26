import { UserSeedInput } from "../schemas/user.schema";
import { mediaBaseUrl } from "../../config/env";

export const usersSeedData: UserSeedInput[] = [
  // ---------- MEMBERS ----------
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password123",
    role: "member",
    darkMode: false,
    language: "en",
    gender: "male",
    birthDate: new Date("1990-01-01").toISOString(),
    interests: ["Dinner", "Restaurant", "Pub"],
    name: "John Doe"
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "password123",
    role: "member",
    gender: "female",
    interests: ["Free Entry", "Students"],
    name: "Jane Smith",
    avatar: `http://${mediaBaseUrl}/users/default.png`
  },
  {
    username: "alice95",
    email: "alice@example.com",
    password: "password123",
    role: "member",
    darkMode: true,
    language: "it",
    gender: "female",
    birthDate: new Date("1995-05-10").toISOString(),
    interests: ["Live Music", "Club"],
    name: "Alice Rossi",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Artist and musician"
  },
  {
    username: "bob",
    email: "bob@example.com",
    password: "password123",
    role: "member",
    interests: ["Bar", "Restaurant"],
    name: "Bob Bianchi",
    avatar: `http://${mediaBaseUrl}/users/default.png`
  },
  {
    username: "carol",
    email: "carol@example.com",
    password: "password123",
    role: "member",
    darkMode: true,
    interests: ["Dinner", "Party"],
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Loves good food and fun nights out"
  },
  {
    username: "dave",
    email: "dave@example.com",
    password: "password123",
    role: "member",
    language: "it",
    gender: "male",
    interests: ["Students", "Outdoor"],
    name: "Davide Neri",
    avatar: `http://${mediaBaseUrl}/users/default.png`
  },
  {
    username: "emma_lopez",
    email: "emmalopez@example.com",
    password: "password123",
    role: "member",
    darkMode: true,
    language: "es",
    interests: ["Reggaeton", "DJ Set"],
    name: "Emma Lopez",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Music lover"
  },
  {
    username: "frank",
    email: "frank@example.com",
    password: "password123",
    role: "member",
    gender: "male",
    birthDate: new Date("1988-07-15").toISOString(),
    interests: ["Pub", "Theatre"],
    name: "Francesco Bianchi",
    avatar: `http://${mediaBaseUrl}/users/default.png`
  },
  {
    username: "grace",
    email: "grace@example.com",
    password: "password123",
    role: "member",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Traveler and foodie"
  },
  {
    username: "henry_photographer",
    email: "henry@example.com",
    password: "password123",
    role: "member",
    darkMode: true,
    language: "de",
    gender: "male",
    name: "Henry Neri",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Engineer and hobbyist photographer"
  },

  // ---------- ORGANIZATIONS ----------
  {
    username: "Cocoricò",
    email: "contact@cocorico.com",
    password: "p@ssword123",
    role: "organization",
    language: "it",
    interests: ["DJ Set", "Over 18"],
    name: "Cocoricò",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Nightlife club in Italy",
    contacts: ["https://www.cocorico.it"]
  },
  {
    username: "Di and Gi Srl",
    email: "contact@diandgi.com",
    password: "password123",
    role: "organization",
    darkMode: true,
    language: "it",
    interests: ["Concert"],
    name: "D'Alessandro & Galli",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Leader in business music sector"
  },
  {
    username: "stagevibes",
    email: "contact@stagevibes.com",
    password: "password123",
    role: "organization",
    interests: ["Show", "Live Music"],
    name: "Stage Vibes",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "We bring live shows and music to the stage"
  },
  {
    username: "cornerbar",
    email: "info@cornerbar.it",
    password: "password123",
    role: "organization",
    language: "it",
    interests: ["Bar"],
    name: "Corner Bar",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "A cozy bar for drinks, chats and good vibes"
  },
  {
    username: "openair_fest",
    email: "info@openair.com",
    password: "F3st!v@l#",
    role: "organization",
    interests: ["Party", "Outdoor"],
    name: "Open Air Fest",
    avatar: `http://${mediaBaseUrl}/users/default.png`
  },
  {
    username: "sing&fun",
    email: "hello@singandfun.com",
    password: "password123",
    role: "organization",
    darkMode: true,
    interests: ["Karaoke", "Party"],
    name: "Sing & Fun",
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Join us for fun karaoke nights and lively parties"
  },
  {
    username: "taste_nightlife",
    email: "contact@tastenightlife.com",
    password: "password123",
    role: "organization",
    language: "en",
    interests: ["Dinner", "Show", "Live Music"],
    name: "Taste & Nightlife",
    bio: "Combining delicious dinners with live music and entertaining shows"
  },
  {
    username: "sunset_vibes",
    email: "contact@sunsetvibes.com",
    password: "Suns3t!2026",
    role: "organization",
    language: "fr",
    interests: ["Party", "Outdoor"],
    name: "Sunset Vibes",
    avatar: `http://${mediaBaseUrl}/users/default.png`
  },
  {
    username: "exclusive_nights",
    email: "contact@exclusivenights.com",
    password: "hD9#sQ4!jZ6p",
    role: "organization",
    interests: ["Private Event", "Over 18"],
    name: "Exclusive Nights",
    avatar: `http://${mediaBaseUrl}/users/default.png`
  },
  {
    username: "electric_rockers",
    email: "contact@electricrockers.com",
    password: "G@l@xyR0ck!",
    role: "organization",
    language: "en",
    interests: ["Rock", "Electronic", "Live Music"],
    avatar: `http://${mediaBaseUrl}/users/default.png`,
    bio: "Bringing electrifying rock and electronic live shows to the stage"
  }
];
