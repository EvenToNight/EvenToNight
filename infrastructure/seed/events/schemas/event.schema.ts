import { z } from "zod";
import { TagsSchema } from "../../tags.schema";

const EventStatusSchema = z.enum([
  "draft",
  "published",
  "cancelled",
  "completed"
]);

const BaseEventSeedSchema = z.object({
  creator: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(TagsSchema).optional(),
  location: z.object({
    address: z.string(),
    city: z.string(),
    country: z.string(),
  }).optional(),
  date: z.string().datetime().optional(),
  price: z.number().optional(),
  collaborators: z.array(z.string()).optional()
});

const DraftEventSeedSchema = BaseEventSeedSchema.extend({
  status: z.literal("draft"),
  poster: z.string().optional()
});

const NonDraftEventSeedSchema = BaseEventSeedSchema.extend({
  status: EventStatusSchema.exclude(["draft"]),
  poster: z.string()
});

export const EventSeedSchema = z.discriminatedUnion("status", [
  DraftEventSeedSchema,
  NonDraftEventSeedSchema
]);

export type EventStatus = z.infer<typeof EventStatusSchema>;

export type EventSeedInput = z.infer<typeof EventSeedSchema>;
