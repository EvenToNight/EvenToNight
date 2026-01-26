import dotenv from "dotenv";
import { join } from "path/win32";

const envFromRoot: Record<string, string> = {};
dotenv.config({
  path: join(__dirname, "..", "..", "..", ".env"),
  processEnv: envFromRoot,
});

if (
  !process.env.NOTIFICATIONS_SERVICE_PORT &&
  envFromRoot["NOTIFICATIONS_SERVICE_PORT"]
) {
  process.env.NOTIFICATIONS_SERVICE_PORT =
    envFromRoot["NOTIFICATIONS_SERVICE_PORT"];
}

if (
  process.env.ENV === "development" &&
  !process.env.RABBITMQ_USER &&
  envFromRoot["RABBITMQ_USER"]
) {
  process.env.RABBITMQ_USER = envFromRoot["RABBITMQ_USER"];
}

if (
  process.env.ENV === "development" &&
  !process.env.RABBITMQ_PASS &&
  envFromRoot["RABBITMQ_PASS"]
) {
  process.env.RABBITMQ_PASS = envFromRoot["RABBITMQ_PASS"];
}

const rabbitMQHost = process.env.RABBITMQ_HOST || "localhost";
const rabbitMQUser = process.env.RABBITMQ_USER || "guest";
const rabbitMQPass = process.env.RABBITMQ_PASS || "guest";

export const config = {
  port: process.env.NOTIFICATIONS_SERVICE_PORT!,
  mongodbUri: `mongodb://${process.env.MONGO_HOST || "localhost"}:27017/eventonight-notifications`,
  jwtAuthPublicKeyUrl: process.env.AUTH_PUBLIC_KEY_URL || "",
  rabbitmq: {
    host: rabbitMQHost,
    user: rabbitMQUser,
    pass: rabbitMQPass,
    exchange: "eventonight",
    queue: "notifications_queue",
    url: `amqp://${rabbitMQUser}:${rabbitMQPass}@${rabbitMQHost}:5672`,
  },
};
