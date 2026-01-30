import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export function createNotificationRoutes(
  controller: NotificationController,
): Router {
  const router = Router();
  router.use(authMiddleware);

  // router.get("/", (req, res) => controller.getNotifications(req, res));   // controller.getNotification.bind(controller)

  router.get("/:userId", (req, res) =>
    controller.getNotificationsByUserId(req, res),
  );

  return router;
}
