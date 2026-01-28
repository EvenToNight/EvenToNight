import { FollowSeedInput } from "../schemas/follow.schema";

export const followsSeedData: FollowSeedInput[] = [
  // ---------- MEMBER → MEMBER ----------
  { follower: "john_doe", followed: "bob" },
  { follower: "john_doe", followed: "carol" },

  { follower: "jane_smith", followed: "emma_lopez" },
  { follower: "jane_smith", followed: "alice95" },

  { follower: "alice95", followed: "henry_photographer" },
  { follower: "alice95", followed: "emma_lopez" },

  { follower: "bob", followed: "john_doe" },
  { follower: "bob", followed: "frank" },

  { follower: "carol", followed: "grace" },

  { follower: "dave", followed: "jane_smith" },

  { follower: "emma_lopez", followed: "alice95" },
  { follower: "emma_lopez", followed: "carol" },

  { follower: "frank", followed: "bob" },

  { follower: "grace", followed: "john_doe" },

  { follower: "henry_photographer", followed: "alice95" },

  // ---------- MEMBER → ORGANIZATION ----------
  { follower: "john_doe", followed: "cornerbar" },
  { follower: "john_doe", followed: "taste_nightlife" },

  { follower: "jane_smith", followed: "openair_fest" },
  { follower: "jane_smith", followed: "sing&fun" },

  { follower: "alice95", followed: "stagevibes" },
  { follower: "alice95", followed: "electric_rockers" },

  { follower: "bob", followed: "cornerbar" },
  { follower: "bob", followed: "taste_nightlife" },

  { follower: "carol", followed: "exclusive_nights" },
  { follower: "carol", followed: "sunset" },

  { follower: "dave", followed: "openair_fest" },
  { follower: "dave", followed: "sunset" },

  { follower: "emma_lopez", followed: "Cocoricò" },
  { follower: "emma_lopez", followed: "sunset" },

  { follower: "frank", followed: "cornerbar" },
  { follower: "frank", followed: "stagevibes" },

  { follower: "grace", followed: "taste_nightlife" },

  { follower: "henry_photographer", followed: "stagevibes" },
  { follower: "henry_photographer", followed: "electric_rockers" },

  // ---------- ORGANIZATION → ORGANIZATION (branding / partnership-like) ----------
  { follower: "stagevibes", followed: "electric_rockers" },
  { follower: "openair_fest", followed: "sunset" },
  { follower: "sing&fun", followed: "stagevibes" },
  { follower: "taste_nightlife", followed: "stagevibes" },
];
