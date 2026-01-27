import { z } from "zod";
import { TagsSchema } from "../../tags.schema";

const EventStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED"
]);

const BaseEventSeedSchema = z.object({
  creator: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(TagsSchema).optional(),
  location: z.object({
    name: z.string(),
    country: z.string(),
    country_code: z.string(),
    state: z.string().optional(),
    province: z.string().optional(),
    city: z.string(),
    road: z.string().optional(),
    postcode: z.string().optional(),
    house_number: z.string().optional(),
    lat: z.number().optional(),
    lon: z.number().optional(),
    link: z.string().url().optional(),
  }).optional(),
  date: z.string().datetime().optional(),
  instant: z.string().datetime().optional(),
  collaborators: z.array(z.string()).optional()
});

const DraftEventSeedSchema = BaseEventSeedSchema.extend({
  status: z.literal("DRAFT"),
  poster: z.string().optional()
});

const NonDraftEventSeedSchema = BaseEventSeedSchema.extend({
  status: EventStatusSchema.exclude(["DRAFT"]),
  poster: z.string()
});

export const EventSeedSchema = z.discriminatedUnion("status", [
  DraftEventSeedSchema,
  NonDraftEventSeedSchema
]);

export type EventStatus = z.infer<typeof EventStatusSchema>;

export type EventSeedInput = z.infer<typeof EventSeedSchema>;
