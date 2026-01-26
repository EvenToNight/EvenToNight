import { Tag } from "../../tags.schema";
import { EventStatus } from "../schemas/event.schema";

export interface EventToCreate {
  title?: string;
  description?: string;
  poster?: string;
  tags?: Tag[];
  location?: { address: string; city: string; country: string };
  date?: string;
  price?: number;
  status: EventStatus;
  creatorId: string;
  collaboratorsIds?: string[];
}

export type SeedEvent = EventToCreate & {
  _id: string;
  instant: string;
};

export interface EventSeedResult {
  events: SeedEvent[];
}
