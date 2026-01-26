import { MEDIA_BASE_URL } from "../config/env";
import { UserSeedInput } from "./schemas/user.schema";
import { SeedUser } from "./types/users.types";

export function toSeedUser(
  input: UserSeedInput,
  userId: string
): SeedUser {
  const base = {
    id: userId,
    role: input.role,
    username: input.username,
    email: input.email,
    darkMode: input.darkMode ?? false,
    language: input.language ?? "en",
    interests: input.interests,
    name: input.name ?? input.username,
    avatar: input.avatar ?? `http://${MEDIA_BASE_URL}/users/default.png`,
    bio: input.bio
  };

  if (input.role === "member") {
    return {
      ...base,
      role: "member",
      gender: input.gender,
      birthDate: input.birthDate
    };
  }

  return {
    ...base,
    role: "organization",
    contacts: input.contacts
  };
}
