import { z } from "zod";
import { TagsSchema } from "../../tags.schema";
const mediaBaseUrl = process.env.MEDIA_BASE_URL || "localhost:9020";

const BaseUserSeedSchema = {
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  darkMode: z.boolean().default(false).optional(),
  language: z.string().default("en").optional(),
  interests: z.array(TagsSchema).optional(),
  name: z.string().optional(),
  avatar: z.string().default(`http://${mediaBaseUrl}/users/default.png`).optional(),
  bio: z.string().optional(),
};

const MemberSeedSchema = z.object({
  ...BaseUserSeedSchema,
  role: z.literal("member"),
  gender: z.enum(["male", "female"]).optional(),
  birthDate: z.string().datetime().optional(),
});

const OrganizationSeedSchema = z.object({
  ...BaseUserSeedSchema,
  role: z.literal("organization"),
  contacts: z.array(z.string()).optional(),
});

export const UserSeedSchema = z.discriminatedUnion("role", [
  MemberSeedSchema,
  OrganizationSeedSchema,
]);

export type UserSeedInput = z.infer<typeof UserSeedSchema>;
