import { z } from "zod";

const mediaBaseUrl = process.env.MEDIA_BASE_URL || "localhost:9020";

export const UserSeedSchema = z.object({
  ref: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["member", "organization"]),
  darkMode: z.boolean().default(false).optional(),
  language: z.string().default("en").optional(),
  gender: z.enum(["male", "female"]).optional(),
  birthDate: z.string().datetime().optional(),
  interests: z.array(z.string()).optional(),
  name: z.string(),
  avatar: z.literal(`http://${mediaBaseUrl}/users/default.png`),
  bio: z.string().optional(),
  contacts: z.array(z.string()).optional()
});

export type UserSeed = z.infer<typeof UserSeedSchema>;
