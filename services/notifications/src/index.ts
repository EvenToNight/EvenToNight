import { MongoDB } from "./config/mongodb.config";
import { RabbitMQ } from "./config/rabbitmq.config";

import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { createApp } from "./app";
import { config } from "./config/env.config";

import { NotificationController } from "./notifications/presentation/controllers/notification.controller";
import { createNotificationRoutes } from "./notifications/presentation/routes/notification.routes";
import { UserController } from "./notifications/presentation/controllers/user.controller";
import { createUserRoutes } from "./notifications/presentation/routes/user.routes";

import { RabbitMQConsumer } from "./notifications/presentation/consumers/rabbitmq.consumer";
import { SocketIOGateway } from "./notifications/presentation/gateways/socket-io.gateway";
import { CreateNotificationFromEventHandler } from "./notifications/application/handlers/create-notification-from-event.handler";
import { NotificationCreatedEvent } from "./notifications/domain/events/notification-created.event";
import { InMemoryEventPublisher } from "./notifications/infrastructure/events/in-memory-event-publisher";
import { SocketNotificationHandler } from "./notifications/infrastructure/events/handlers/socket-notification.handler";
import { MongoNotificationRepository } from "./notifications/infrastructure/persistence/mongodb/repositories/mongo-notification.repository";
import { MongoFollowRepository } from "./notifications/infrastructure/persistence/mongodb/repositories/mongo-follow.repository";
import { ProcessFollowEventHandler } from "./notifications/application/handlers/process-follow-event.handler";
import { ProcessUnfollowEventHandler } from "./notifications/application/handlers/process-unfollow-event.handler";
import { ProcessMessageEventHandler } from "./notifications/application/handlers/process-message-event.handler";
import { EventRouter } from "./notifications/application/routers/event-router";
import { SocketMessageHandler } from "./notifications/infrastructure/events/handlers/socket-message.handler";
import { ProcessEventCreatedHandler } from "./notifications/application/handlers/process-event-created.handler";
import { GetNotificationsHandler } from "./notifications/application/handlers/get-notifications.handler";
import { MarkAsReadHandler } from "./notifications/application/handlers/mark-as-read.handler";
import { GetUnreadCountHandler } from "./notifications/application/handlers/get-unread-count.handler";
import { IsOnlineHandler } from "./notifications/application/handlers/is-online.handler";
import { MarkAllAsReadHandler } from "./notifications/application/handlers/mark-all-as-read.handler";

async function bootstrap() {
  try {
    await MongoDB.connect();
    await RabbitMQ.setup();

    const notificationRepository = new MongoNotificationRepository();
    const followRepository = new MongoFollowRepository();
    const eventPublisher = new InMemoryEventPublisher();

    const createNotificationHandler = new CreateNotificationFromEventHandler(
      notificationRepository,
      eventPublisher,
    );

    const processFollowHandler = new ProcessFollowEventHandler(
      followRepository,
      createNotificationHandler,
    );

    const processUnfollowHandler = new ProcessUnfollowEventHandler(
      followRepository,
    );

    const processMessageHandler = new ProcessMessageEventHandler(
      eventPublisher,
    );

    const processEventCreatedHandler = new ProcessEventCreatedHandler(
      followRepository,
      notificationRepository,
      eventPublisher,
    );

    const eventRouter = new EventRouter(
      createNotificationHandler,
      processFollowHandler,
      processMessageHandler,
      processUnfollowHandler,
      processEventCreatedHandler,
    );

    const getNotificationsHandler = new GetNotificationsHandler(
      notificationRepository,
    );

    const markAsReadHandler = new MarkAsReadHandler(notificationRepository);

    const getUnreadCountHandler = new GetUnreadCountHandler(
      notificationRepository,
    );

    const markAllAsReadHandler = new MarkAllAsReadHandler(
      notificationRepository,
    );

    const notificationController = new NotificationController(
      getNotificationsHandler,
      getUnreadCountHandler,
      markAsReadHandler,
      markAllAsReadHandler,
    );
    const notificationRoutes = createNotificationRoutes(notificationController);

    const app = createApp();
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: true,
        credentials: true,
      },
    });

    let pubClient: ReturnType<typeof createClient> | null = null;
    let subClient: ReturnType<typeof createClient> | null = null;

    if (config.redisUrl) {
      pubClient = createClient({ url: config.redisUrl });
      subClient = pubClient.duplicate();

      pubClient.on("error", (err) =>
        console.error("Redis pubClient error:", err),
      );
      subClient.on("error", (err) =>
        console.error("Redis subClient error:", err),
      );

      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
    }

    const socketGateway = new SocketIOGateway(io);

    const isOnlineHandler = new IsOnlineHandler(socketGateway);

    const userController = new UserController(isOnlineHandler);
    const userRoutes = createUserRoutes(userController);

    app.use("/", notificationRoutes);
    app.use("/users", userRoutes);

    app.use((req, res) => {
      res.status(404).json({ error: "Not found" });
    });

    const socketNotificationHandler = new SocketNotificationHandler(
      socketGateway,
    );

    eventPublisher.subscribe(
      NotificationCreatedEvent.name,
      socketNotificationHandler.handle.bind(socketNotificationHandler),
    );

    const socketMessageHandler = new SocketMessageHandler(socketGateway);
    eventPublisher.subscribe("MessageReceivedEvent", (event) =>
      socketMessageHandler.handle(event),
    );

    const rabbitmqConsumer = new RabbitMQConsumer(eventRouter);
    await rabbitmqConsumer.connect();
    httpServer.listen(config.port, () => {
      console.log(`🚀 Notification service running on port ${config.port}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`${signal} received, shutting down gracefully...`);
      try {
        await new Promise<void>((resolve, reject) =>
          httpServer.close((err) => (err ? reject(err) : resolve())),
        );
        await rabbitmqConsumer.close();
        await Promise.all([pubClient?.quit(), subClient?.quit()]);
        await MongoDB.disconnect();
        console.log("Graceful shutdown complete");
        process.exit(0);
      } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
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
