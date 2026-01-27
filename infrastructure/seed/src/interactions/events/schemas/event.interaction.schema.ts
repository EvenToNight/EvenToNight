import { z } from "zod";

const EventStatusSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CANCELLED",
  "COMPLETED"
]);

export type EventStatus = z.infer<typeof EventStatusSchema>;