import { EVENTS_BASE_URL } from "../../config/env";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { EventToCreate } from "../types/events.types";

export async function createEvent(event: EventToCreate, posterPath?: string): Promise<{ eventId: string }> {
  const formData = new FormData();
  formData.append("event", JSON.stringify(event));

  if (posterPath) {
    formData.append("poster", fs.createReadStream(posterPath), path.basename(posterPath));
  }

  const response = await axios.post<{ eventId: string }>(EVENTS_BASE_URL, formData);

  return response.data;
}


import { mockUploadPoster } from "./mock.media.service";
import crypto from "crypto";
export async function createMockEvent(
  event: EventToCreate,
  posterPath?: string
): Promise<{ eventId: string; posterUrl?: string }> {
  const eventId = crypto.randomUUID();

  const posterUrl = mockUploadPoster(eventId, posterPath);

  console.log(`[MOCK] Created event ${eventId} with poster: ${posterUrl}`);

  return { eventId, posterUrl };
}

