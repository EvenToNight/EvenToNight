import { MongoDB } from "./config/mongodb.config";
import { RabbitMQ } from "./config/rabbitmq.config";

import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app";
import { config } from "./config/env.config";

import { NotificationController } from "./notifications/presentation/controllers/notification.controller";
import { createNotificationRoutes } from "./notifications/presentation/routes/notification.routes";

import { RabbitMQConsumer } from "./notifications/presentation/consumers/rabbitmq.consumer";
import { SocketIOGateway } from "./notifications/presentation/gateways/socket-io.gateway";
import { CreateNotificationFromEventHandler } from "notifications/application/handlers/create-notification-from-event.handler";
import { NotificationCreatedEvent } from "notifications/domain/events/notification-created.event";
import { InMemoryEventPublisher } from "notifications/infrastructure/events/in-memory-event-publisher";
import { SocketNotificationHandler } from "notifications/infrastructure/events/handlers/socket-notification.handler";
import { MongoNotificationRepository } from "notifications/infrastructure/persistence/mongodb/repositories/mongo-notification.repository";

async function bootstrap() {
  try {
    await MongoDB.connect();
    await RabbitMQ.setup();

    const controller = new NotificationController();
    const routes = createNotificationRoutes(controller);
    const app = createApp(routes);
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      },
    });

    const socketGateway = new SocketIOGateway(io);

    const notificationRepository = new MongoNotificationRepository();
    const eventPublisher = new InMemoryEventPublisher();

    const socketHandler = new SocketNotificationHandler(socketGateway);
    eventPublisher.subscribe(
      NotificationCreatedEvent.name,
      socketHandler.handle.bind(socketHandler),
    );

    const createNotificationHandler = new CreateNotificationFromEventHandler(
      notificationRepository,
      eventPublisher,
    );

    const rabbitmqConsumer = new RabbitMQConsumer(createNotificationHandler);
    await rabbitmqConsumer.connect();
    httpServer.listen(config.port, () => {
      console.log(`🚀 Notification service running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap()
  .then(() => {
    console.log("Bootstrap completed");
  })
  .catch((error) => {
    console.error("Bootstrap failed:", error);
  });
