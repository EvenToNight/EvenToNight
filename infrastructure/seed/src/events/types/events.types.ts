import { Tag } from "../../tags.schema";
import { EventStatus } from "../schemas/event.schema";

export interface EventToCreate {
  title: string;
  description?: string;
  poster?: string;
  tags?: Tag[];
  location?: { 
    name: string;
    country: string;
    country_code: string;
    state?: string;
    province?: string;
    city: string;
    road?: string;
    postcode?: string;
    house_number?: string;
    lat?: number;
    lon?: number;
    link?: string;
  };
  date?: string;
  status: EventStatus;
  creatorId: string;
  collaboratorsIds?: string[];
  isFree?: boolean;
}

export type SeedEvent = EventToCreate & {
  _id: string;
  instant: string;
};

export interface EventSeedResult {
  events: SeedEvent[];
}
