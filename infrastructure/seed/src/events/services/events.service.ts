import { MEDIA_BASE_URL } from "../../config/env";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { EventToCreate, SeedEvent } from "../types/events.types";
import crypto from "crypto";
import { execSync } from "child_process";
import { HOST } from "../../config/env";


export async function createEvent(event: EventToCreate): Promise<SeedEvent> {
  const eventId = crypto.randomUUID();

  const posterPath = event.poster ? path.resolve("src/events/data/posters", event.poster) : undefined;
  const prevUrl = `http://media.${HOST}`
  const defaultPosterUrl = prevUrl + `/event-default.jpg`;

  let posterUrl = defaultPosterUrl;

  if (posterPath) {
    if (fs.existsSync(posterPath)) {
      posterUrl = prevUrl + "/" + (await axios.post(
        `${MEDIA_BASE_URL}/events/${eventId}`,
        (() => {
          const form = new FormData();
          form.append('file', fs.createReadStream(posterPath));
          return form;
        })()
      )).data.url;
    } else {
      console.warn(`[WARNING] Poster file not found: ${posterPath}, using default poster`);
    }
  }

  const DOCKER_CONTAINER =
    process.env.EVENT_MONGO_URI || "eventonight-mongo-events-1";
  const MONGO_DB = process.env.MONGO_DB || "eventonight";
  
  const eventToInsert = {
    _id: eventId,
    ...event,
    poster: posterUrl,
    instant: new Date().toISOString(),
  };
  
  const insertCommand = `db.events.insertOne(${JSON.stringify(eventToInsert)})`;

  try {
    execSync(
      `docker exec ${DOCKER_CONTAINER} mongosh ${MONGO_DB} --quiet --eval '${insertCommand}'`,
      { stdio: "pipe" }
    );
    console.log(`[DB] Event inserted: ${eventId}`);

    return eventToInsert;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to insert event ${eventId}: ${errorMessage}`);
  }
}