import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export function createNotificationRoutes(
  controller: NotificationController,
): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get("/", (req, res, next) =>
    controller.getNotificationsByUserId(req, res, next),
  );

  router.get("/unread-count", (req, res, next) =>
    controller.getUnreadCount(req, res, next),
  );

  return router;
}
